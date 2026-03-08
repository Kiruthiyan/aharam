package com.aharam.tuition.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    @NotBlank(message = "Login ID is required. (Username, Email, or Student ID)")
    private String loginId;

    @NotBlank(message = "Password is required.")
    private String password;
}
