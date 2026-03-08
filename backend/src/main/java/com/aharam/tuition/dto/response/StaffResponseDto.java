package com.aharam.tuition.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StaffResponseDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private boolean active;
    private boolean passwordChangeRequired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
