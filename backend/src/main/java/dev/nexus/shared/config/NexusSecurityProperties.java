package dev.nexus.shared.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Data
@ConfigurationProperties(prefix = "nexus.security")
public class NexusSecurityProperties {

    private String jwtSecret = "change-me-in-production";
    private long jwtExpirationMs = 86400000;
    private List<String> homeSubnets = List.of("192.168.0.0/16", "10.66.66.0/24");
}
