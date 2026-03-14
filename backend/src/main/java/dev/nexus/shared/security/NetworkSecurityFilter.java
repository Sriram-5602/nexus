package dev.nexus.shared.security;

import dev.nexus.shared.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Blocks REMOTE access to Vault and Console endpoints.
 * HOME network (WiFi/VPN) and LOCALHOST get full access.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NetworkSecurityFilter extends OncePerRequestFilter {

    private static final List<String> HOME_ONLY_PATHS = List.of(
            "/api/v1/vault",
            "/api/v1/admin"
    );

    private final NetworkUtils networkUtils;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean isHomePath = HOME_ONLY_PATHS.stream().anyMatch(path::startsWith);

        if (isHomePath) {
            NetworkTrust trust = networkUtils.determineTrust(request);
            if (trust == NetworkTrust.REMOTE) {
                String clientIp = networkUtils.extractClientIp(request);
                log.warn("Blocked REMOTE access to {} from {}", path, clientIp);

                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                objectMapper.writeValue(response.getWriter(),
                        ApiResponse.error("This resource is only accessible from the home network"));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
