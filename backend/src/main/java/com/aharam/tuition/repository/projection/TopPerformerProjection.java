package com.aharam.tuition.repository.projection;

public interface TopPerformerProjection {
    String getStudentId();

    String getName();

    String getCenter();

    Integer getExamBatch();

    Double getAverageScore();

    Long getExamsCount();
}
