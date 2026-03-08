package com.aharam.tuition.exception;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.util.ErrorMessageUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        FieldError firstError = ex.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        String message = firstError != null && firstError.getDefaultMessage() != null
                ? firstError.getDefaultMessage()
                : "Please check your input.";
        return buildError(HttpStatus.BAD_REQUEST, message, mapValidationCode(firstError));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException ex) {
        var violation = ex.getConstraintViolations().stream().findFirst().orElse(null);
        String message = violation != null ? violation.getMessage() : "Please check your input.";
        String property = violation != null ? violation.getPropertyPath().toString() : null;
        return buildError(HttpStatus.BAD_REQUEST, message, mapValidationCode(property));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotReadable(HttpMessageNotReadableException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "Malformed request payload.", "INVALID_REQUEST_BODY");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        return buildError(HttpStatus.FORBIDDEN, "You do not have permission to perform this action.", "FORBIDDEN");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthentication(AuthenticationException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, "Authentication failed.", "UNAUTHORIZED");
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleEntityNotFound(EntityNotFoundException ex) {
        return buildError(HttpStatus.NOT_FOUND, ErrorMessageUtil.safeMessage(ex, "Requested resource was not found."),
                "RESOURCE_NOT_FOUND");
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNoHandler(NoHandlerFoundException ex) {
        return buildError(HttpStatus.NOT_FOUND, "Requested endpoint was not found.", "ENDPOINT_NOT_FOUND");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ErrorMessageUtil.safeMessage(ex, "Invalid request."),
                "INVALID_ARGUMENT");
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusiness(BusinessException ex) {
        return buildError(ex.getHttpStatus(),
                ErrorMessageUtil.safeMessage(ex, "Business operation failed."),
                ex.getErrorCode());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception ex) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred.", "INTERNAL_ERROR");
    }

    private ResponseEntity<ApiResponse<Object>> buildError(HttpStatus status, String message, String code) {
        return ResponseEntity.status(status).body(ApiResponse.error(message, code));
    }

    private String mapValidationCode(FieldError error) {
        if (error == null) {
            return "VALIDATION_FAILED";
        }
        return mapValidationCode(error.getField());
    }

    private String mapValidationCode(String fieldPath) {
        if (fieldPath == null) {
            return "VALIDATION_FAILED";
        }
        String normalized = fieldPath.toLowerCase();
        if (normalized.contains("password")) {
            return "WEAK_PASSWORD";
        }
        if (normalized.contains("email")) {
            return "INVALID_EMAIL_FORMAT";
        }
        if (normalized.contains("phone")) {
            return "INVALID_PHONE_FORMAT";
        }
        if (normalized.contains("otp")) {
            return "INVALID_OTP_FORMAT";
        }
        return "VALIDATION_FAILED";
    }
}
