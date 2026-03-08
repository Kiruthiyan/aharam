package com.aharam.tuition.dto;

import com.aharam.tuition.entity.StudentStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StudentUpdateRequest {
    private String fullName;
    private String fatherName;
    private String fatherOccupation;
    private String motherName;
    private String motherOccupation;
    private String guardianName;
    private String schoolName;
    private String center;
    private String medium;

    @Min(value = 2000, message = "Exam batch must be valid.")
    private Integer examBatch;

    private String gender;
    private String subjects;
    private String address;

    @Pattern(
            regexp = "^$|" + ValidationPatterns.EMAIL_REGEX,
            message = "Please enter a valid email address.")
    private String email;

    @Pattern(
            regexp = "^$|" + ValidationPatterns.PHONE_INPUT_REGEX,
            message = "Phone number format is invalid.")
    private String parentPhoneNumber;

    @Pattern(
            regexp = "^$|" + ValidationPatterns.PHONE_INPUT_REGEX,
            message = "Phone number format is invalid.")
    private String whatsappNumber;

    private StudentStatus status;
}
