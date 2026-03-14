package dev.nexus.core.health;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
public class ServiceHealthChecker {

    private final DataSource dataSource;
    private final RedisConnectionFactory redisConnectionFactory;
    private final RestTemplate restTemplate;
    private final String minioUrl;
    private final String ollamaUrl;

    public ServiceHealthChecker(
            DataSource dataSource,
            RedisConnectionFactory redisConnectionFactory,
            RestTemplate restTemplate,
            @Value("${nexus.services.minio-url:http://localhost:9000}") String minioUrl,
            @Value("${nexus.services.ollama-url:http://localhost:11434}") String ollamaUrl) {
        this.dataSource = dataSource;
        this.redisConnectionFactory = redisConnectionFactory;
        this.restTemplate = restTemplate;
        this.minioUrl = minioUrl;
        this.ollamaUrl = ollamaUrl;
    }

    public Map<String, String> checkAll() {
        Map<String, String> results = new LinkedHashMap<>();
        results.put("postgres", checkPostgres());
        results.put("redis", checkRedis());
        results.put("minio", checkMinio());
        results.put("ollama", checkOllama());
        return results;
    }

    private String checkPostgres() {
        try (Connection conn = dataSource.getConnection()) {
            conn.createStatement().execute("SELECT 1");
            return "UP";
        } catch (Exception e) {
            log.warn("PostgreSQL health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }

    private String checkRedis() {
        try {
            String pong = redisConnectionFactory.getConnection().ping();
            return "PONG".equals(pong) ? "UP" : "DOWN";
        } catch (Exception e) {
            log.warn("Redis health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }

    private String checkMinio() {
        try {
            restTemplate.getForEntity(minioUrl + "/minio/health/live", String.class);
            return "UP";
        } catch (Exception e) {
            log.warn("MinIO health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }

    private String checkOllama() {
        try {
            restTemplate.getForEntity(ollamaUrl + "/api/tags", String.class);
            return "UP";
        } catch (Exception e) {
            log.warn("Ollama health check failed: {}", e.getMessage());
            return "DOWN";
        }
    }
}
