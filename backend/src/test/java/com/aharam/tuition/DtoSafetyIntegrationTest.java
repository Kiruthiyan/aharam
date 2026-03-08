package com.aharam.tuition;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.support.IntegrationTestBase;
import com.aharam.tuition.support.TestFixtureFactory;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class DtoSafetyIntegrationTest extends IntegrationTestBase {

    @Autowired
    private TestFixtureFactory fixtures;

    @Test
    void staffEndpointShouldNotLeakSensitiveUserFields() {
        User admin = fixtures.createUser(Role.SUPER_ADMIN, true);
        fixtures.createUser(Role.STAFF, true);

        String adminToken = loginAndGetToken(admin.getEmail(), "Passw0rd!");
        ResponseEntity<JsonNode> response = exchangeWithToken(adminToken, "/api/admin/staff", HttpMethod.GET, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.get("status").asText()).isEqualTo("success");
        assertThat(body.get("data").isArray()).isTrue();
        assertThat(body.get("data").size()).isGreaterThan(0);

        JsonNode first = body.get("data").get(0);
        assertThat(first.has("password")).isFalse();
        assertThat(first.has("passwordResetToken")).isFalse();
        assertThat(first.has("passwordResetExpires")).isFalse();
        assertThat(first.has("deletedAt")).isFalse();
        assertThat(first.has("email")).isTrue();
        assertThat(first.has("role")).isTrue();
    }
}
