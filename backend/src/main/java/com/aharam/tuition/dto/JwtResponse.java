package com.aharam.tuition.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private Long id;
    private String username;
    private String displayName; // Student Name or Username
    private String role;
    private boolean requirePasswordChange;
}
