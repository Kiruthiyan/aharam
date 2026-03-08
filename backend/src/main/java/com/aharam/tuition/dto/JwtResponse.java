package com.aharam.tuition.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private Long id;
    private String username; // Login identity: username, email, or Student ID
    private String displayName; // Student Name or User Full Name
    private String role;
    private boolean requirePasswordChange;
}
