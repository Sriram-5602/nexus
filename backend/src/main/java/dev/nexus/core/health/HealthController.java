package dev.nexus.core.health;

import dev.nexus.shared.dto.ApiResponse;
import dev.nexus.shared.security.NetworkTrust;
import dev.nexus.shared.security.NetworkUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class HealthController {

    private final ServiceHealthChecker healthChecker;
    private final NetworkUtils networkUtils;

    @GetMapping("/health")
    public ApiResponse<HealthResponse> health(HttpServletRequest request) {
        Map<String, String> services = healthChecker.checkAll();
        NetworkTrust trust = networkUtils.determineTrust(request);

        boolean allUp = services.values().stream().allMatch("UP"::equals);
        String status = allUp ? "UP" : "DEGRADED";

        HealthResponse response = HealthResponse.builder()
                .status(status)
                .services(services)
                .networkTrust(trust)
                .build();

        return ApiResponse.success(response);
    }
}
