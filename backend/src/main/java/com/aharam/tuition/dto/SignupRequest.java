package com.aharam.tuition.dto;

import lombok.Data;
import java.util.Set;

@Data
public class SignupRequest {
    private String username;
    private String password;
    private String role; // "admin", "staff", "parent"
}
