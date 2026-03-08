package com.aharam.tuition.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class StudentDetailDto {
    private String studentId;
    private String fullName;
    private String fatherName;
    private String motherName;
    private String fatherOccupation;
    private String motherOccupation;
    private String schoolName;
    private String center;
    private String medium;
    private String gender;
    private Integer examBatch;
    private String subjects;
    private String address;
    private String email;
    private String parentPhoneNumber;
    private String whatsappNumber;
    private String status;
    private LocalDate admissionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
