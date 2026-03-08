package com.aharam.tuition.repository.projection;

import java.time.LocalDateTime;

public interface StudentListProjection {
    String getStudentId();

    String getFullName();

    Integer getExamBatch();

    String getCenter();

    String getMedium();

    String getGender();

    String getStatus();

    String getParentPhoneNumber();

    String getEmail();

    LocalDateTime getCreatedAt();

    LocalDateTime getUpdatedAt();

    LocalDateTime getDeletedAt();
}
