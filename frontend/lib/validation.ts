const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value.trim());

export const isStrongPassword = (value: string): boolean => STRONG_PASSWORD_REGEX.test(value);

export const normalizePhoneDigits = (value: string): string => value.replace(/\D/g, "");

export const isValidPhone = (value: string): boolean => {
    const digits = normalizePhoneDigits(value);
    return digits.length >= 10 && digits.length <= 15;
};

export const isSixDigitOtp = (value: string): boolean => /^\d{6}$/.test(value.trim());
