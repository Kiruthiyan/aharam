package com.aharam.tuition;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.support.IntegrationTestBase;
import com.aharam.tuition.support.TestFixtureFactory;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ApiErrorContractIntegrationTest extends IntegrationTestBase {

    @Autowired
    private TestFixtureFactory fixtures;

    @Test
    void shouldWrapUnauthorizedForbiddenNotFoundBadRequestAndServerErrors() {
        ResponseEntity<JsonNode> unauthorized = restTemplate.exchange("/api/students", HttpMethod.GET, HttpEntity.EMPTY,
                JsonNode.class);
        assertThat(unauthorized.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertErrorContract(unauthorized.getBody());

        User admin = fixtures.createUser(Role.SUPER_ADMIN, true);
        User staff = fixtures.createUser(Role.STAFF, true);

        String adminToken = loginAndGetToken(admin.getEmail(), "Passw0rd!");
        String staffToken = loginAndGetToken(staff.getEmail(), "Passw0rd!");

        ResponseEntity<JsonNode> forbidden = exchangeWithToken(staffToken, "/api/admin/ping", HttpMethod.GET, null);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertErrorContract(forbidden.getBody());

        ResponseEntity<JsonNode> notFound = exchangeWithToken(adminToken, "/api/does-not-exist", HttpMethod.GET, null);
        assertThat(notFound.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertErrorContract(notFound.getBody());

        ResponseEntity<JsonNode> badRequest = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", admin.getEmail()),
                JsonNode.class);
        assertThat(badRequest.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertErrorContract(badRequest.getBody());

        ResponseEntity<JsonNode> internalError = exchangeWithToken(
                adminToken,
                "/api/attendance/batch/2026?start=bad-date&end=2026-01-01",
                HttpMethod.GET,
                null);
        assertThat(internalError.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertErrorContract(internalError.getBody());
    }

    private void assertErrorContract(JsonNode body) {
        assertThat(body).isNotNull();
        assertThat(body.hasNonNull("status")).isTrue();
        assertThat(body.get("status").asText()).isEqualTo("error");
        assertThat(body.has("data")).isTrue();
        assertThat(body.get("data").isNull()).isTrue();
        assertThat(body.hasNonNull("message")).isTrue();
        assertThat(body.hasNonNull("timestamp")).isTrue();
    }
}
