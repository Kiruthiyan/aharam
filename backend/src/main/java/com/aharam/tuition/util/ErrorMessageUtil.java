package com.aharam.tuition.util;

public final class ErrorMessageUtil {
    private ErrorMessageUtil() {
    }

    public static String safeMessage(Throwable throwable, String fallback) {
        if (throwable == null) {
            return fallback;
        }
        String message = throwable.getMessage();
        if (message == null || message.isBlank()) {
            return fallback;
        }
        return message;
    }
}
