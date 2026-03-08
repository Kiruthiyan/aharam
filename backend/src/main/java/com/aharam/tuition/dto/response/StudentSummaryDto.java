package com.aharam.tuition.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class StudentSummaryDto {
    private String studentId;
    private String fullName;
    private String fatherName;
    private String motherName;
    private String fatherOccupation;
    private String motherOccupation;
    private String schoolName;
    private Integer examBatch;
    private String batchOrClass;
    private String center;
    private String medium;
    private String gender;
    private String email;
    private String address;
    private String status;
    private String parentPhoneNumber;
    private String whatsappNumber;
    private LocalDate admissionDate;
}
