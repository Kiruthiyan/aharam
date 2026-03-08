package com.aharam.tuition.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NoticeResponseDto {
    private Long id;
    private String title;
    private String message;
    private String audience;
    private String channel;
    private String sentBy;
    private String sentByRole;
    private String at;
    private String status;
    private Integer whatsappCount;
    private LocalDateTime createdAt;
}
