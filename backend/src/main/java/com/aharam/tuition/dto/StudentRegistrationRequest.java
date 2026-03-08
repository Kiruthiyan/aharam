package com.aharam.tuition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StudentRegistrationRequest {
    @NotBlank(message = "Student full name is required.")
    private String fullName;

    @NotBlank(message = "Father name is required.")
    private String fatherName;

    private String fatherOccupation;

    @NotBlank(message = "Mother name is required.")
    private String motherName;

    private String motherOccupation;
    private String guardianName;
    private String schoolName;

    @NotBlank(message = "Center is required.")
    private String center;

    @NotBlank(message = "Medium is required.")
    private String medium;

    @NotNull(message = "Exam batch is required.")
    private Integer examBatch;

    @NotBlank(message = "Gender is required.")
    private String gender;

    private String subjects;
    private String address;

    @Pattern(
            regexp = "^$|" + ValidationPatterns.EMAIL_REGEX,
            message = "Please enter a valid email address.")
    private String email;

    @NotBlank(message = "Parent phone number is required.")
    @Pattern(regexp = ValidationPatterns.PHONE_INPUT_REGEX, message = "Phone number format is invalid.")
    private String parentPhoneNumber;

    @Pattern(
            regexp = "^$|" + ValidationPatterns.PHONE_INPUT_REGEX,
            message = "Phone number format is invalid.")
    private String whatsappNumber;

    private String gradeLevel;
}
