package com.aharam.tuition.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Username is required.")
    private String username;

    @NotBlank(message = "Current password is required.")
    private String oldPassword;

    @NotBlank(message = "New password is required.")
    @Pattern(
            regexp = ValidationPatterns.STRONG_PASSWORD_REGEX,
            message = "Password must be at least 8 characters and include upper, lower, number, and special character.")
    private String newPassword;
}
