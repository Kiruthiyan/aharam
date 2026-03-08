package com.aharam.tuition.dto;

public final class ValidationPatterns {

    private ValidationPatterns() {
    }

    public static final String STRONG_PASSWORD_REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$";

    public static final String EMAIL_REGEX =
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

    public static final String PHONE_INPUT_REGEX =
            "^[+]?[-0-9\\s()]{8,25}$";

    public static final String OTP_REGEX = "^\\d{6}$";
}
