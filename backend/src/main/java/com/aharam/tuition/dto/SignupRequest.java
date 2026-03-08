package com.aharam.tuition.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
public class SignupRequest {
    @NotBlank(message = "Name is required.")
    private String username;

    @NotBlank(message = "Email is required.")
    @Email(message = "Please enter a valid email address.")
    private String email;

    @NotBlank(message = "Password is required.")
    @Pattern(
            regexp = ValidationPatterns.STRONG_PASSWORD_REGEX,
            message = "Password must be at least 8 characters and include upper, lower, number, and special character.")
    private String password;

    private String role; // "super_admin", "staff", "student"
}
