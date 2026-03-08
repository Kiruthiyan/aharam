package com.aharam.tuition.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ExamResponseDto {
    private Long id;
    private String name;
    private String batch;
    private String subject;
    private Double maxMarks;
    private LocalDate examDate;
    private String status;
    private Long createdById;
    private LocalDateTime createdAt;
}
