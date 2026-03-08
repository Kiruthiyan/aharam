package com.aharam.tuition.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FeeStatusDto {
    private Long id;
    private String studentId;
    private String studentName;
    private String academicYear;
    private String month;
    private String status;
    private String updateMethod;
    private Long updatedById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
