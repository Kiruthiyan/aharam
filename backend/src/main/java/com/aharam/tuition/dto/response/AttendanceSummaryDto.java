package com.aharam.tuition.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class AttendanceSummaryDto {
    private Long id;
    private String studentId;
    private String studentName;
    private LocalDate date;
    private String status;
    private String method;
    private String batchOrClass;
    private String center;
    private LocalTime time;
    private String teacherNotes;
    private Long markedById;
    private LocalDateTime createdAt;
}
