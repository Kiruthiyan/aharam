package com.aharam.tuition.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StudentListItemDto {
    private String studentId;
    private String fullName;
    private Integer examBatch;
    private String center;
    private String medium;
    private String gender;
    private String status;
    private String parentPhoneNumber;
    private String email;
    private boolean deleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
