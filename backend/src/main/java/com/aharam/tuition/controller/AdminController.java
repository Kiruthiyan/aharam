package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<Map<String, String>>> ping() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("status", "ok"), "Admin module is reachable."));
    }
}
