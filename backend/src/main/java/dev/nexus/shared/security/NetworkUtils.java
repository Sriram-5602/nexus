package dev.nexus.shared.security;

// =============================================================================
// NetworkUtils.java
// Package: dev.nexus.shared.security
//
// WHAT IS THIS FILE?
// This class answers one question for every incoming HTTP request:
//   "How much should we trust the client making this request?"
//
// It returns one of three trust levels (defined in NetworkTrust.java):
//   LOCALHOST → request came from 127.x.x.x (the server itself)
//   HOME      → request came from home WiFi (192.168.x.x) or WireGuard VPN (10.66.66.x)
//   REMOTE    → request came from the open internet — untrusted
//
// WHY DOES THIS EXIST?
// Certain Nexus features (Vault, Console/Grafana, Actuator health endpoints)
// must never be accessible from the open internet, even if someone knows
// the Cloudflare domain. Nginx is the first line of defense; this class is
// the second — inside the Java application itself.
//
// WHERE IS IT USED?
// NetworkSecurityFilter (a Spring Security filter) calls determineTrust()
// on every request. If a REMOTE client tries to hit /vault/** or /console/**,
// the filter returns 403 Forbidden before any controller even runs.
//
// HOW IT FITS WITH NGINX:
// Nginx sets the X-Real-IP header to the client's true IP (stripping any proxy
// hops). This class reads that header to get the real client IP — not the IP
// of the Docker network or the Nginx container, which would be useless.
// =============================================================================

import dev.nexus.shared.config.NexusSecurityProperties;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;

// @Slf4j: Lombok generates a `log` field (SLF4J logger) so we can write
// log.info(...) and log.error(...) without manually declaring a Logger.
@Slf4j

// @Component: Tells Spring to create a single instance of this class
// (a "bean") and make it available for injection everywhere via @Autowired
// or constructor injection. You'll never call `new NetworkUtils()` yourself.
@Component
public class NetworkUtils {

    // ─── Constants ───────────────────────────────────────────────────────────

    // The loopback range (127.0.0.0 to 127.255.255.255).
    // Any request from these IPs came from the server itself (e.g. health
    // check scripts running on the same machine, or inter-container calls
    // that resolve to localhost).
    // This is static because it never changes — it's the same on every machine.
    private static final CidrRange LOOPBACK = CidrRange.parse("127.0.0.0/8");

    // ─── Fields ──────────────────────────────────────────────────────────────

    // The list of "home" CIDR ranges, loaded from application config.
    // Typically: ["192.168.0.0/16", "10.66.66.0/24", "172.16.0.0/12"]
    // Storing them as parsed CidrRange objects (not raw strings) means
    // we do the expensive bit-math parsing ONCE at startup, not on every request.
    private final List<CidrRange> homeRanges;


    // ─── Constructor (Spring Dependency Injection) ────────────────────────────
    // Spring calls this automatically, injecting NexusSecurityProperties
    // (which reads from application.yml). We parse all subnet strings
    // into CidrRange objects here so it's done once, not on every request.
    public NetworkUtils(NexusSecurityProperties properties) {
        this.homeRanges = properties.getHomeSubnets().stream()
                .map(CidrRange::parse)   // "192.168.0.0/16" → CidrRange object
                .toList();               // collect into an immutable list

        log.info("Network trust configured with {} home subnets", homeRanges.size());
        // On startup you'll see: "Network trust configured with 3 home subnets"
    }


    // =========================================================================
    // PUBLIC API
    // =========================================================================

    /**
     * Determines the trust level for a real HTTP request.
     * This is the main entry point called by NetworkSecurityFilter.
     *
     * It extracts the client IP from the request headers first,
     * then delegates to the String-based overload below.
     */
    public NetworkTrust determineTrust(HttpServletRequest request) {
        String ip = extractClientIp(request);
        return determineTrust(ip);
    }

    /**
     * Determines trust for a raw IP string.
     * Also useful in tests — you can pass "192.168.1.1" directly without
     * needing a mock HttpServletRequest.
     *
     * The check order matters:
     *   1. Null/blank → safest default: REMOTE
     *   2. IPv6 loopback (::1 and its verbose form) → LOCALHOST
     *   3. IPv4 loopback via CIDR check (127.x.x.x) → LOCALHOST
     *   4. Any home subnet match → HOME
     *   5. Nothing matched → REMOTE
     */
    public NetworkTrust determineTrust(String ip) {
        // Guard: never trust a request we can't identify
        if (ip == null || ip.isBlank()) {
            return NetworkTrust.REMOTE;
        }

        // IPv6 loopback addresses for localhost:
        //   "::1"                  → compact form (what you usually see)
        //   "0:0:0:0:0:0:0:1"     → fully expanded form (same address)
        // We check these as string literals because InetAddress.getByName("::1")
        // works, but the CIDR class below only handles IPv4 (4-byte addresses).
        if (LOOPBACK.contains(ip) || "0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return NetworkTrust.LOCALHOST;
        }

        // Walk through all configured home ranges.
        // For Nexus this is typically:
        //   192.168.0.0/16  → home WiFi LAN
        //   10.66.66.0/24   → WireGuard VPN clients
        //   172.16.0.0/12   → Docker internal network (container-to-container calls)
        for (CidrRange range : homeRanges) {
            if (range.contains(ip)) {
                return NetworkTrust.HOME;
            }
        }

        // Nothing matched → internet traffic → untrusted
        return NetworkTrust.REMOTE;
    }

    /**
     * Extracts the real client IP address from an HTTP request.
     *
     * WHY NOT JUST USE request.getRemoteAddr()?
     * Because in Nexus, all traffic goes through Nginx first.
     * From Spring Boot's perspective, EVERY request comes from Nginx
     * (usually 172.17.0.x — a Docker internal IP). If we used
     * getRemoteAddr(), everyone would look like they're from Docker,
     * and the trust check would always return HOME. Wrong!
     *
     * Nginx helpfully sets two headers with the real client IP:
     *   X-Real-IP           → set in nginx.conf: proxy_set_header X-Real-IP $remote_addr
     *   X-Forwarded-For     → standard proxy chain header (e.g. "1.2.3.4, 10.0.0.1")
     *
     * We check X-Real-IP first (Nginx sets this to exactly one IP — the client).
     * X-Forwarded-For is a fallback, and we take only the FIRST entry because
     * it's the leftmost = the original client (subsequent entries are proxies).
     *
     * SECURITY NOTE: In a multi-proxy setup, X-Forwarded-For can be spoofed
     * by clients adding fake entries. For Nexus (single Nginx), this is fine.
     * If you ever add a CDN in front, revisit this.
     */
    public String extractClientIp(HttpServletRequest request) {
        // Priority 1: X-Real-IP — set explicitly by Nginx in nginx.conf.
        // This is a single, clean IP with no comma-separated list.
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }

        // Priority 2: X-Forwarded-For — standard proxy header.
        // Format: "clientIP, proxy1IP, proxy2IP"
        // We only want the leftmost entry (the original client IP).
        // Example: "192.168.1.45, 172.17.0.2" → we return "192.168.1.45"
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        // Fallback: no proxy headers present.
        // This only happens if a request bypasses Nginx and hits Spring Boot
        // directly (e.g. during local development without Docker).
        return request.getRemoteAddr();
    }


    // =========================================================================
    // INNER CLASS: CidrRange
    // =========================================================================
    // Why is this a static inner class?
    // It's only used by NetworkUtils. Making it inner keeps it encapsulated —
    // no other class in the project can accidentally instantiate a CidrRange.
    // "static" means it doesn't need a NetworkUtils instance to exist,
    // which is correct since we also use it for the LOOPBACK constant.
    // =========================================================================
    static class CidrRange {

        // A CIDR range like "192.168.0.0/16" is stored as two integers:
        //   network = 192.168.0.0 as a 32-bit int (the "base" address, masked)
        //   mask    = 255.255.0.0 as a 32-bit int (which bits are "fixed")
        //
        // Storing as ints lets us do subnet checks with a single bitwise AND,
        // which is O(1) — extremely fast, even on every HTTP request.
        private final int network;
        private final int mask;

        private CidrRange(int network, int mask) {
            this.network = network;
            this.mask = mask;
        }

        /**
         * Parses a CIDR string like "192.168.0.0/16" into a CidrRange.
         *
         * HOW THE MASK IS BUILT:
         * For /16: we want the top 16 bits set to 1, bottom 16 set to 0.
         * 0xFFFFFFFF is all 32 bits = 1 in binary.
         * Left-shifting by (32 - 16) = 16 gives: 1111111111111111 0000000000000000
         * That's the mask 255.255.0.0 in binary.
         *
         * For /24: shift by (32 - 24) = 8 → 11111111 11111111 11111111 00000000 = 255.255.255.0
         * For /32: shift by 0 → all 32 bits = 1 → exact single IP match
         *
         * The special case: prefixLen == 0 means "match everything" (/0).
         * Shifting a 32-bit int by 32 is undefined behavior in Java, so we
         * manually return mask = 0 (which means: no bits are fixed → match any IP).
         *
         * We store `network & mask` (not just `network`) to ensure the host bits
         * are zeroed. "192.168.1.0/16" and "192.168.0.0/16" should behave identically.
         */
        static CidrRange parse(String cidr) {
            try {
                String[] parts = cidr.split("/");  // ["192.168.0.0", "16"]

                // InetAddress.getByName() parses the IP string to a byte array
                InetAddress addr = InetAddress.getByName(parts[0]);
                byte[] bytes = addr.getAddress();

                // IPv6 addresses return 16 bytes; we only support IPv4 (4 bytes)
                // The home subnets in Nexus are all IPv4, so this is fine.
                if (bytes.length != 4) {
                    log.warn("IPv6 CIDR not supported: {}", cidr);
                    return new CidrRange(0, 0);  // degenerate range that matches nothing
                }

                int network = toInt(bytes);        // convert 4 bytes → single int
                int prefixLen = Integer.parseInt(parts[1]);

                // Build the bitmask from the prefix length
                // Example: /16 → 0xFFFFFFFF << 16 = 0xFFFF0000 = 255.255.0.0
                int mask = prefixLen == 0 ? 0 : (0xFFFFFFFF << (32 - prefixLen));

                // `network & mask` zeros out the host portion.
                // "192.168.1.0/16" → network = 192.168.1.0, mask = 255.255.0.0
                //                  → stored network = 192.168.0.0 (host bits zeroed)
                return new CidrRange(network & mask, mask);

            } catch (UnknownHostException e) {
                log.error("Invalid CIDR range: {}", cidr, e);
                return new CidrRange(0, 0);  // degenerate range; won't match anything real
            }
        }

        /**
         * Checks if a given IP address falls within this CIDR range.
         *
         * THE ALGORITHM (one line of bit math):
         *   (ipInt & mask) == network
         *
         * Step by step for 192.168.1.45 against 192.168.0.0/16:
         *   ipInt   = 11000000 10101000 00000001 00101101  (192.168.1.45)
         *   mask    = 11111111 11111111 00000000 00000000  (255.255.0.0)
         *   AND     = 11000000 10101000 00000000 00000000  (192.168.0.0)
         *   network = 11000000 10101000 00000000 00000000  (192.168.0.0)
         *   Result: MATCH → IP is in the subnet ✓
         *
         * For 45.12.88.3 against 192.168.0.0/16:
         *   ipInt   = 00101101 00001100 01011000 00000011  (45.12.88.3)
         *   mask    = 11111111 11111111 00000000 00000000
         *   AND     = 00101101 00001100 00000000 00000000  (45.12.0.0)
         *   network = 11000000 10101000 00000000 00000000  (192.168.0.0)
         *   Result: NO MATCH → IP is not in the subnet ✗
         */
        boolean contains(String ip) {
            try {
                InetAddress addr = InetAddress.getByName(ip);
                byte[] bytes = addr.getAddress();
                if (bytes.length != 4) return false;  // IPv6 not supported — not home
                int ipInt = toInt(bytes);
                return (ipInt & mask) == network;
            } catch (UnknownHostException e) {
                // Malformed IP string → can't be trusted → treat as not in range
                return false;
            }
        }

        /**
         * Converts a 4-byte IPv4 address array into a single 32-bit integer.
         *
         * WHY `& 0xFF`?
         * Java bytes are signed (-128 to 127). The IP byte for 192 is stored
         * as -64 (because 192 > 127). If we just did `bytes[0] << 24`, Java
         * would sign-extend the byte to a negative int, corrupting the result.
         * `bytes[0] & 0xFF` masks it to 0-255 (unsigned) before shifting.
         *
         * Example for 192.168.1.45:
         *   bytes = [192, 168, 1, 45] (but Java stores as [-64, -88, 1, 45])
         *   (-64 & 0xFF) = 192   → shift left 24 → 0xC0000000
         *   (-88 & 0xFF) = 168   → shift left 16 → 0x00A80000
         *   (  1 & 0xFF) =   1   → shift left  8 → 0x00000100
         *   ( 45 & 0xFF) =  45   → shift left  0 → 0x0000002D
         *   OR all together      =               → 0xC0A8012D = 3232235821
         */
        private static int toInt(byte[] bytes) {
            return ((bytes[0] & 0xFF) << 24)
                 | ((bytes[1] & 0xFF) << 16)
                 | ((bytes[2] & 0xFF) << 8)
                 | (bytes[3] & 0xFF);
        }
    }
}