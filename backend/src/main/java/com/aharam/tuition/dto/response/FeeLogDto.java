package com.aharam.tuition.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FeeLogDto {
    private Long id;
    private Long feeId;
    private String oldStatus;
    private String newStatus;
    private String method;
    private Long changedById;
    private LocalDateTime changedAt;
}
