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

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class SoftDeleteIntegrationTest extends IntegrationTestBase {

    @Autowired
    private TestFixtureFactory fixtures;

    @Test
    void deletedStaffShouldBeHiddenAndUnableToAuthenticate() {
        User admin = fixtures.createUser(Role.SUPER_ADMIN, true);
        User staff = fixtures.createUser(Role.STAFF, true);

        String adminToken = loginAndGetToken(admin.getEmail(), "Passw0rd!");

        ResponseEntity<JsonNode> deleteResponse = exchangeWithToken(
                adminToken,
                "/api/admin/staff/" + staff.getId(),
                HttpMethod.DELETE,
                null);
        assertThat(deleteResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<JsonNode> listResponse = exchangeWithToken(adminToken, "/api/admin/staff", HttpMethod.GET, null);
        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode data = listResponse.getBody().get("data");
        boolean stillPresent = false;
        for (JsonNode item : data) {
            if (item.get("id").asLong() == staff.getId()) {
                stillPresent = true;
                break;
            }
        }
        assertThat(stillPresent).isFalse();

        ResponseEntity<JsonNode> loginDeletedStaff = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", staff.getEmail(), "password", "Passw0rd!"),
                JsonNode.class);
        assertThat(loginDeletedStaff.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(loginDeletedStaff.getBody().get("status").asText()).isEqualTo("error");
    }
}
