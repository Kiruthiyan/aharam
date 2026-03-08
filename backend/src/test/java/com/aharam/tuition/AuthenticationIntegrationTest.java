package com.aharam.tuition;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.UserRepository;
import com.aharam.tuition.support.IntegrationTestBase;
import com.aharam.tuition.support.TestFixtureFactory;
import com.fasterxml.jackson.databind.JsonNode;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class AuthenticationIntegrationTest extends IntegrationTestBase {

    private static final String TEST_JWT_SECRET =
            "test-only-jwt-secret-for-hs512-please-do-not-use-in-production-1234567890abcdef";

    @Autowired
    private TestFixtureFactory fixtures;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void loginShouldWorkForSuperAdminStaffAndStudent() {
        User superAdmin = fixtures.createUser(Role.SUPER_ADMIN, true);
        User staff = fixtures.createUser(Role.STAFF, true);
        Student student = fixtures.createStudent("passw0rd");

        ResponseEntity<JsonNode> superAdminLogin = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", superAdmin.getEmail(), "password", "Passw0rd!"),
                JsonNode.class);
        ResponseEntity<JsonNode> staffLogin = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", staff.getEmail(), "password", "Passw0rd!"),
                JsonNode.class);
        ResponseEntity<JsonNode> studentLogin = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", student.getUser().getEmail(), "password", "passw0rd"),
                JsonNode.class);

        assertThat(superAdminLogin.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(staffLogin.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(studentLogin.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(superAdminLogin.getBody().path("data").path("token").asText()).isNotBlank();
        assertThat(staffLogin.getBody().path("data").path("token").asText()).isNotBlank();
        assertThat(studentLogin.getBody().path("data").path("token").asText()).isNotBlank();
    }

    @Test
    void invalidCredentialsAndValidationErrorsShouldBeWrapped() {
        User superAdmin = fixtures.createUser(Role.SUPER_ADMIN, true);

        ResponseEntity<JsonNode> invalidEmail = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", "missing@example.test", "password", "Passw0rd!"),
                JsonNode.class);
        ResponseEntity<JsonNode> invalidPassword = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", superAdmin.getEmail(), "password", "wrong-pass"),
                JsonNode.class);
        ResponseEntity<JsonNode> emptyEmail = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", "", "password", "Passw0rd!"),
                JsonNode.class);
        ResponseEntity<JsonNode> emptyPassword = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", superAdmin.getEmail(), "password", ""),
                JsonNode.class);

        assertThat(invalidEmail.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(invalidPassword.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(emptyEmail.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(emptyPassword.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(invalidEmail.getBody().path("status").asText()).isEqualTo("error");
        assertThat(invalidPassword.getBody().path("status").asText()).isEqualTo("error");
        assertThat(emptyEmail.getBody().path("status").asText()).isEqualTo("error");
        assertThat(emptyPassword.getBody().path("status").asText()).isEqualTo("error");
    }

    @Test
    void disabledAndSoftDeletedAccountsShouldNotAuthenticate() {
        User disabled = fixtures.createUser(Role.STAFF, false);
        User toDelete = fixtures.createUser(Role.STAFF, true);
        User admin = fixtures.createUser(Role.SUPER_ADMIN, true);

        String adminToken = loginAndGetToken(admin.getEmail(), "Passw0rd!");
        ResponseEntity<JsonNode> delete = exchangeWithToken(adminToken, "/api/admin/staff/" + toDelete.getId(), HttpMethod.DELETE, null);
        assertThat(delete.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<JsonNode> disabledLogin = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", disabled.getEmail(), "password", "Passw0rd!"),
                JsonNode.class);
        ResponseEntity<JsonNode> deletedLogin = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", toDelete.getEmail(), "password", "Passw0rd!"),
                JsonNode.class);

        assertThat(disabledLogin.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(disabledLogin.getBody().path("message").asText()).isEqualTo("Account is inactive.");
        assertThat(deletedLogin.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void jwtShouldBeRejectedWhenMissingMalformedSignatureChangedOrExpired() {
        User admin = fixtures.createUser(Role.SUPER_ADMIN, true);
        String token = loginAndGetToken(admin.getEmail(), "Passw0rd!");

        ResponseEntity<JsonNode> withoutToken = restTemplate.exchange("/api/admin/ping", HttpMethod.GET, HttpEntity.EMPTY, JsonNode.class);
        ResponseEntity<JsonNode> malformed = exchangeWithToken("not-a-jwt", "/api/admin/ping", HttpMethod.GET, null);

        String[] tokenParts = token.split("\\.");
        String tampered = tokenParts[0] + "." + tokenParts[1] + ".invalid-signature";
        ResponseEntity<JsonNode> tamperedResponse = exchangeWithToken(tampered, "/api/admin/ping", HttpMethod.GET, null);

        String expired = buildExpiredToken(admin.getEmail());
        ResponseEntity<JsonNode> expiredResponse = exchangeWithToken(expired, "/api/admin/ping", HttpMethod.GET, null);

        assertThat(withoutToken.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(malformed.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(tamperedResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(expiredResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void tokenShouldCarryCorrectRoleClaim() {
        User staff = fixtures.createUser(Role.STAFF, true);
        ResponseEntity<JsonNode> login = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", staff.getEmail(), "password", "Passw0rd!"),
                JsonNode.class);
        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        String token = login.getBody().path("data").path("token").asText();

        String[] parts = token.split("\\.");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        assertThat(payload).contains("\"role\":\"STAFF\"");
    }

    @Test
    void passwordFlowShouldSupportChangeForgotOtpAndSingleUseReset() {
        User user = fixtures.createUser(Role.STAFF, true, true, "OldPass1!");

        ResponseEntity<JsonNode> firstLogin = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", user.getEmail(), "password", "OldPass1!"),
                JsonNode.class);
        assertThat(firstLogin.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(firstLogin.getBody().path("data").path("requirePasswordChange").asBoolean()).isTrue();
        assertThat(firstLogin.getBody().path("data").has("password")).isFalse();

        ResponseEntity<JsonNode> invalidOld = restTemplate.postForEntity(
                "/api/auth/change-password",
                Map.of("username", user.getEmail(), "oldPassword", "WrongOld!", "newPassword", "NewPass2!"),
                JsonNode.class);
        assertThat(invalidOld.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        ResponseEntity<JsonNode> changed = restTemplate.postForEntity(
                "/api/auth/change-password",
                Map.of("username", user.getEmail(), "oldPassword", "OldPass1!", "newPassword", "NewPass2!"),
                JsonNode.class);
        assertThat(changed.getStatusCode()).isEqualTo(HttpStatus.OK);

        User changedUser = userRepository.findByEmail(user.getEmail()).orElseThrow();
        assertThat(changedUser.isPasswordChangeRequired()).isFalse();
        assertThat(changedUser.getPassword()).startsWith("$2");
        assertThat(passwordEncoder.matches("NewPass2!", changedUser.getPassword())).isTrue();

        ResponseEntity<JsonNode> oldPasswordLogin = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", user.getEmail(), "password", "OldPass1!"),
                JsonNode.class);
        ResponseEntity<JsonNode> newPasswordLogin = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", user.getEmail(), "password", "NewPass2!"),
                JsonNode.class);
        assertThat(oldPasswordLogin.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(newPasswordLogin.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<JsonNode> forgot = restTemplate.postForEntity(
                "/api/auth/forgot-password",
                Map.of("email", user.getEmail()),
                JsonNode.class);
        assertThat(forgot.getStatusCode()).isEqualTo(HttpStatus.OK);

        User otpUser = userRepository.findByEmail(user.getEmail()).orElseThrow();
        assertThat(otpUser.getPasswordResetToken()).isNotBlank();
        assertThat(otpUser.getPasswordResetExpires()).isAfter(LocalDateTime.now());

        ResponseEntity<JsonNode> invalidOtp = restTemplate.postForEntity(
                "/api/auth/verify-otp",
                Map.of("email", user.getEmail(), "otp", "000000"),
                JsonNode.class);
        assertThat(invalidOtp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        otpUser.setPasswordResetExpires(LocalDateTime.now().minusMinutes(1));
        userRepository.save(otpUser);
        ResponseEntity<JsonNode> expiredOtp = restTemplate.postForEntity(
                "/api/auth/verify-otp",
                Map.of("email", user.getEmail(), "otp", otpUser.getPasswordResetToken()),
                JsonNode.class);
        assertThat(expiredOtp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        otpUser.setPasswordResetExpires(LocalDateTime.now().plusMinutes(15));
        userRepository.save(otpUser);
        String validOtp = otpUser.getPasswordResetToken();
        ResponseEntity<JsonNode> reset = restTemplate.postForEntity(
                "/api/auth/reset-password",
                Map.of("email", user.getEmail(), "otp", validOtp, "newPassword", "ResetPass3!"),
                JsonNode.class);
        assertThat(reset.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<JsonNode> reuse = restTemplate.postForEntity(
                "/api/auth/reset-password",
                Map.of("email", user.getEmail(), "otp", validOtp, "newPassword", "ResetAgain4!"),
                JsonNode.class);
        assertThat(reuse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        ResponseEntity<JsonNode> relogin = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("username", user.getEmail(), "password", "ResetPass3!"),
                JsonNode.class);
        assertThat(relogin.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    private String buildExpiredToken(String username) {
        Key key = Keys.hmacShaKeyFor(TEST_JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis() - 10_000))
                .setExpiration(new Date(System.currentTimeMillis() - 1_000))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
}
