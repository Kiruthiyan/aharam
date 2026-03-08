package com.aharam.tuition.support;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.PostConstruct;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class IntegrationTestBase {

    private static final boolean DOCKER_AVAILABLE = isDockerAvailable();
    private static PostgreSQLContainer<?> postgres;

    static {
        if (DOCKER_AVAILABLE) {
            postgres = new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("aharam_test")
                    .withUsername("postgres")
                    .withPassword("postgres");
            postgres.start();
        }
    }

    @Autowired
    protected TestRestTemplate restTemplate;

    @PostConstruct
    void configureRestTemplate() {
        var httpClient = HttpClients.custom()
                .disableAutomaticRetries()
                .build();
        restTemplate.getRestTemplate().setRequestFactory(new HttpComponentsClientHttpRequestFactory(httpClient));
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (DOCKER_AVAILABLE) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
            registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
            registry.add("spring.flyway.enabled", () -> "true");
            registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
            registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
        } else {
            registry.add("spring.datasource.url",
                    () -> "jdbc:h2:mem:aharam_test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE;NON_KEYWORDS=MONTH");
            registry.add("spring.datasource.username", () -> "sa");
            registry.add("spring.datasource.password", () -> "");
            registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
            registry.add("spring.flyway.enabled", () -> "false");
            registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
            registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.H2Dialect");
        }
        registry.add("notification.provider", () -> "mock");
        registry.add("spring.mail.host", () -> "localhost");
        registry.add("spring.mail.port", () -> "2525");
        registry.add("app.jwtSecret",
                () -> "test-only-jwt-secret-for-hs512-please-do-not-use-in-production-1234567890abcdef");
    }

    private static boolean isDockerAvailable() {
        try {
            return DockerClientFactory.instance().isDockerAvailable();
        } catch (Exception ignored) {
            return false;
        }
    }

    protected String loginAndGetToken(String username, String password) {
        ResponseEntity<JsonNode> login = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", username, "password", password),
                JsonNode.class);
        assertThat(login.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(login.getBody()).isNotNull();
        return login.getBody().path("data").path("token").asText();
    }

    protected HttpEntity<?> authorizedRequest(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(headers);
    }

    protected ResponseEntity<JsonNode> exchangeWithToken(String token, String path, HttpMethod method, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<?> request = body == null ? new HttpEntity<>(headers) : new HttpEntity<>(body, headers);
        return restTemplate.exchange(path, method, request, JsonNode.class);
    }
}
