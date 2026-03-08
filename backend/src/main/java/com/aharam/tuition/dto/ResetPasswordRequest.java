package com.aharam.tuition.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Email is required.")
    @Email(message = "Please enter a valid email address.")
    private String email;

    @NotBlank(message = "OTP is required.")
    @Pattern(regexp = ValidationPatterns.OTP_REGEX, message = "OTP must be a 6-digit number.")
    private String otp;

    @NotBlank(message = "New password is required.")
    @Pattern(
            regexp = ValidationPatterns.STRONG_PASSWORD_REGEX,
            message = "Password must be at least 8 characters and include upper, lower, number, and special character.")
    private String newPassword;
}
