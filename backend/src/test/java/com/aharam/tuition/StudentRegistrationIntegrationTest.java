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

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class StudentRegistrationIntegrationTest extends IntegrationTestBase {

    @Autowired
    private TestFixtureFactory fixtures;

    @Test
    void shouldRejectDuplicateStudentInSameCenterBatchByNameAndParentPhone() {
        User staff = fixtures.createUser(Role.STAFF, true);
        String token = loginAndGetToken(staff.getEmail(), "Passw0rd!");

        Map<String, Object> firstPayload = baseRegistrationPayload();
        ResponseEntity<JsonNode> first = exchangeWithToken(token, "/api/students/register", HttpMethod.POST, firstPayload);
        assertThat(first.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(first.getBody()).isNotNull();
        assertThat(first.getBody().path("status").asText()).isEqualTo("success");

        Map<String, Object> duplicatePayload = new HashMap<>(firstPayload);
        duplicatePayload.put("fullName", "  arun   kumar  ");
        duplicatePayload.put("parentPhoneNumber", "077-123-4567");
        duplicatePayload.put("email", "another.student@example.test");

        ResponseEntity<JsonNode> duplicate = exchangeWithToken(token, "/api/students/register", HttpMethod.POST,
                duplicatePayload);

        assertThat(duplicate.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(duplicate.getBody()).isNotNull();
        assertThat(duplicate.getBody().path("status").asText()).isEqualTo("error");
        assertThat(duplicate.getBody().path("errorCode").asText()).isEqualTo("DUPLICATE_STUDENT");
        assertThat(duplicate.getBody().path("message").asText()).isNotBlank();
    }

    private Map<String, Object> baseRegistrationPayload() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("fullName", "Arun Kumar");
        payload.put("fatherName", "Kumarasamy");
        payload.put("motherName", "Selvi");
        payload.put("center", "KOKUVIL");
        payload.put("medium", "TAMIL");
        payload.put("examBatch", 2026);
        payload.put("gender", "MALE");
        payload.put("parentPhoneNumber", "0771234567");
        payload.put("email", "student.one@example.test");
        payload.put("subjects", "Tamil, English");
        return payload;
    }
}
