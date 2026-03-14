package dev.nexus.core.health;

import dev.nexus.shared.security.NetworkTrust;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthResponse {

    private String status;
    private Map<String, String> services;
    private NetworkTrust networkTrust;
}
