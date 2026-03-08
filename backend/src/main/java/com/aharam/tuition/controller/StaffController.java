package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.dto.SendVerificationCodeRequest;
import com.aharam.tuition.dto.StaffRegisterRequest;
import com.aharam.tuition.dto.VerifyEmailCodeRequest;
import com.aharam.tuition.dto.response.StaffResponseDto;
import com.aharam.tuition.mapper.ResponseMapper;
import com.aharam.tuition.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/staff", "/api/admin/staff"})
public class StaffController {

    @Autowired
    private StaffService staffService;

    @PostMapping("/send-verification-code")
    public ResponseEntity<ApiResponse<String>> sendVerificationCode(
            @Valid @RequestBody SendVerificationCodeRequest request) {
        String message = staffService.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, message));
    }

    @PostMapping("/verify-email-code")
    public ResponseEntity<ApiResponse<String>> verifyEmailCode(@Valid @RequestBody VerifyEmailCodeRequest request) {
        String message = staffService.verifyEmailCode(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success(null, message));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> registerStaff(@Valid @RequestBody StaffRegisterRequest signUpRequest) {
        String message = staffService.registerStaff(signUpRequest);
        return ResponseEntity.ok(ApiResponse.success(null, message));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StaffResponseDto>>> getAllStaff() {
        List<StaffResponseDto> staff = staffService.getAllStaff().stream()
                .map(ResponseMapper::toStaff)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(staff, "Fetched all staff members."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteStaff(@PathVariable Long id) {
        staffService.softDeleteStaff(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Staff removed successfully."));
    }
}
