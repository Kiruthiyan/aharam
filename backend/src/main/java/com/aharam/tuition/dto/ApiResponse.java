package com.aharam.tuition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private String status; // "success" or "error"
    private T data;
    private String message;
    private String errorCode; // Only populated on errors
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // Helper methods for quick creation
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .status("success")
                .data(data)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String errorCode) {
        String safeMessage = (message == null || message.isBlank()) ? "An unexpected error occurred." : message;
        return ApiResponse.<T>builder()
                .status("error")
                .data(null)
                .message(safeMessage)
                .errorCode(errorCode)
                .build();
    }
}
