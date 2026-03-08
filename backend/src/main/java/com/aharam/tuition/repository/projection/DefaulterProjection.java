package com.aharam.tuition.repository.projection;

public interface DefaulterProjection {
    String getStudentId();

    String getName();

    String getCenter();

    Integer getExamBatch();

    Long getPendingCount();

    String getLatestPendingMonth();
}
