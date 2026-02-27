package com.aharam.tuition.controller;

import com.aharam.tuition.service.NotificationService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Mobile app calls this on startup to register the device push token.
     * POST /api/notifications/token
     * Body: { "userId": "KT2026001", "token": "ExponentPushToken[xxxx]" }
     */
    @PostMapping("/token")
    public ResponseEntity<?> registerToken(@RequestBody TokenRequest request) {
        notificationService.saveToken(request.getUserId(), request.getToken());
        return ResponseEntity.ok("Token registered.");
    }

    @Data
    static class TokenRequest {
        private String userId;
        private String token;
    }
}
