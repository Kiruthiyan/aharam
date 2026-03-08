package com.aharam.tuition;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.UserRepository;
import com.aharam.tuition.support.IntegrationTestBase;
import com.aharam.tuition.support.TestFixtureFactory;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for the new identity refactoring:
 * - username field separation from email
 * - loginId accepting username, email, or Student ID
 * - Student login with Student ID (username)
 */
@DisplayName("Authentication with Username/Email Identity Separation")
class AuthenticationUsernameIntegrationTest extends IntegrationTestBase {

    @Autowired
    private TestFixtureFactory fixtures;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Student should login with Student ID (username)")
    void studentLoginWithStudentId() {
        Student student = fixtures.createStudent("Test@1234");
        User studentUser = student.getUser();
        
        // Login using Student ID stored in username
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("loginId", student.getStudentId(), "password", "Test@1234"),
                JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode data = response.getBody().path("data");
        assertThat(data.path("token").asText()).isNotBlank();
        assertThat(data.path("username").asText()).isEqualTo(student.getStudentId());
        assertThat(data.path("role").asText()).isEqualTo("STUDENT");
        assertThat(data.path("displayName").asText()).isEqualTo(student.getFullName());
    }

    @Test
    @DisplayName("Student login with Student ID should fail with wrong password")
    void studentLoginWithStudentIdFailsWithWrongPassword() {
        Student student = fixtures.createStudent("Test@1234");
        
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("loginId", student.getStudentId(), "password", "WrongPassword"),
                JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody().path("status").asText()).isEqualTo("error");
    }

    @Test
    @DisplayName("Staff should login with email")
    void staffLoginWithEmail() {
        User staff = fixtures.createUser(Role.STAFF, true);
        
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("loginId", staff.getEmail(), "password", "Passw0rd!"),
                JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode data = response.getBody().path("data");
        assertThat(data.path("token").asText()).isNotBlank();
        assertThat(data.path("role").asText()).isEqualTo("STAFF");
    }

    @Test
    @DisplayName("Staff should login with username if set")
    void staffLoginWithUsername() {
        User staff = fixtures.createUser(Role.STAFF, true);
        // Set username for staff
        staff.setUsername("staffuser");
        userRepository.save(staff);
        
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("loginId", "staffuser", "password", "Passw0rd!"),
                JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode data = response.getBody().path("data");
        assertThat(data.path("username").asText()).isEqualTo("staffuser");
    }

    @Test
    @DisplayName("SuperAdmin should login with email")
    void superAdminLoginWithEmail() {
        User superAdmin = fixtures.createUser(Role.SUPER_ADMIN, true);
        
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("loginId", superAdmin.getEmail(), "password", "Passw0rd!"),
                JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode data = response.getBody().path("data");
        assertThat(data.path("role").asText()).isEqualTo("SUPER_ADMIN");
    }

    @Test
    @DisplayName("Login should fail with invalid loginId")
    void loginFailsWithInvalidLoginId() {
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("loginId", "nonexistent@example.com", "password", "SomePassword"),
                JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody().path("status").asText()).isEqualTo("error");
    }

    @Test
    @DisplayName("Login requires loginId field")
    void loginRequiresLoginIdField() {
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("password", "SomePassword"),
                JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Student account should have username = StudentID and optional email")
    void studentAccountStructureAfterRegistration() {
        Student student = fixtures.createStudent("Test@1234");
        User user = student.getUser();

        // Username should be StudentID
        assertThat(user.getUsername()).isEqualTo(student.getStudentId());
        // Email should be student's email (not StudentID)
        assertThat(user.getEmail()).isEqualTo(student.getEmail());
        // Role should be STUDENT
        assertThat(user.getRole()).isEqualTo(Role.STUDENT);
        // Password should be hashed (not equal to plain text)
        assertThat(user.getPassword()).isNotEqualTo("Test@1234");
    }

    @Test
    @DisplayName("Inactive user cannot login")
    void inactiveUserCannotLogin() {
        Student student = fixtures.createStudent("Test@1234");
        User user = student.getUser();
        user.setActive(false);
        userRepository.save(user);

        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("loginId", student.getStudentId(), "password", "Test@1234"),
                JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody().path("message").asText()).contains("inactive");
    }

    @Test
    @DisplayName("Password change required flag should be in response")
    void passwordChangeRequiredFlagInLoginResponse() {
        Student student = fixtures.createStudent("Test@1234");
        User user = student.getUser();
        user.setPasswordChangeRequired(true);
        userRepository.save(user);

        ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("loginId", student.getStudentId(), "password", "Test@1234"),
                JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().path("data").path("requirePasswordChange").asBoolean()).isTrue();
    }
}
