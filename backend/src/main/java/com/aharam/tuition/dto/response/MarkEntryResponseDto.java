package com.aharam.tuition.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MarkEntryResponseDto {
    private Long id;
    private Long examId;
    private String examName;
    private String subject;
    private String studentId;
    private String studentName;
    private Double marksObtained;
    private String grade;
    private String remarks;
    private Long enteredById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
