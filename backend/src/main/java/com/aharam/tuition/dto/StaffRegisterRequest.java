package com.aharam.tuition.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StaffRegisterRequest {
    @NotBlank(message = "Name is required.")
    private String username;

    @NotBlank(message = "Email is required.")
    @Email(message = "Please enter a valid email address.")
    private String email;

    private String role;
}
