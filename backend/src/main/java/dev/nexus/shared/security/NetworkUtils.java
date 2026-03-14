package dev.nexus.shared.security;

import dev.nexus.shared.config.NexusSecurityProperties;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;

@Slf4j
@Component
public class NetworkUtils {

    private static final CidrRange LOOPBACK = CidrRange.parse("127.0.0.0/8");
    private final List<CidrRange> homeRanges;

    public NetworkUtils(NexusSecurityProperties properties) {
        this.homeRanges = properties.getHomeSubnets().stream()
                .map(CidrRange::parse)
                .toList();
        log.info("Network trust configured with {} home subnets", homeRanges.size());
    }

    public NetworkTrust determineTrust(HttpServletRequest request) {
        String ip = extractClientIp(request);
        return determineTrust(ip);
    }

    public NetworkTrust determineTrust(String ip) {
        if (ip == null || ip.isBlank()) {
            return NetworkTrust.REMOTE;
        }

        if (LOOPBACK.contains(ip) || "0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return NetworkTrust.LOCALHOST;
        }

        for (CidrRange range : homeRanges) {
            if (range.contains(ip)) {
                return NetworkTrust.HOME;
            }
        }

        return NetworkTrust.REMOTE;
    }

    public String extractClientIp(HttpServletRequest request) {
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    static class CidrRange {
        private final int network;
        private final int mask;

        private CidrRange(int network, int mask) {
            this.network = network;
            this.mask = mask;
        }

        static CidrRange parse(String cidr) {
            try {
                String[] parts = cidr.split("/");
                InetAddress addr = InetAddress.getByName(parts[0]);
                byte[] bytes = addr.getAddress();
                if (bytes.length != 4) {
                    log.warn("IPv6 CIDR not supported: {}", cidr);
                    return new CidrRange(0, 0);
                }
                int network = toInt(bytes);
                int prefixLen = Integer.parseInt(parts[1]);
                int mask = prefixLen == 0 ? 0 : (0xFFFFFFFF << (32 - prefixLen));
                return new CidrRange(network & mask, mask);
            } catch (UnknownHostException e) {
                log.error("Invalid CIDR range: {}", cidr, e);
                return new CidrRange(0, 0);
            }
        }

        boolean contains(String ip) {
            try {
                InetAddress addr = InetAddress.getByName(ip);
                byte[] bytes = addr.getAddress();
                if (bytes.length != 4) return false;
                int ipInt = toInt(bytes);
                return (ipInt & mask) == network;
            } catch (UnknownHostException e) {
                return false;
            }
        }

        private static int toInt(byte[] bytes) {
            return ((bytes[0] & 0xFF) << 24)
                 | ((bytes[1] & 0xFF) << 16)
                 | ((bytes[2] & 0xFF) << 8)
                 | (bytes[3] & 0xFF);
        }
    }
}
