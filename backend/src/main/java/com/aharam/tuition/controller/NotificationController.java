package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.dto.response.NoticeResponseDto;
import com.aharam.tuition.entity.Notice;
import com.aharam.tuition.mapper.ResponseMapper;
import com.aharam.tuition.repository.NoticeRepository;
import com.aharam.tuition.service.NotificationService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NoticeRepository noticeRepository;

    @PostMapping("/token")
    public ResponseEntity<ApiResponse<String>> registerToken(@RequestBody TokenRequest request) {
        notificationService.saveToken(request.getUserId(), request.getToken());
        return ResponseEntity.ok(ApiResponse.success(null, "Token registered."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoticeResponseDto>>> getNotifications() {
        List<NoticeResponseDto> notices = noticeRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ResponseMapper::toNotice)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(notices, "Fetched notifications."));
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<NoticeResponseDto>> sendNotification(@RequestBody NoticeRequest req,
            Authentication authentication) {
        String senderName = authentication != null ? authentication.getName() : "System";
        String senderRole = authentication != null
                ? authentication.getAuthorities().iterator().next().getAuthority()
                : "ADMIN";

        Notice notice = new Notice();
        notice.setTitle(req.getTitle());
        notice.setMessage(req.getMessage());
        notice.setAudience(req.getAudience());
        notice.setChannel(req.getChannel());
        notice.setSentBy(senderName);
        notice.setSentByRole(senderRole);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        notice.setAt(LocalDateTime.now().format(formatter));
        notice.setStatus("SENT");

        if ("WHATSAPP".equals(req.getChannel()) || "BOTH".equals(req.getChannel())) {
            notice.setWhatsappCount(0);
        }

        Notice saved = noticeRepository.save(notice);
        return ResponseEntity.ok(ApiResponse.success(ResponseMapper.toNotice(saved), "Notification sent."));
    }

    @Data
    static class TokenRequest {
        private String userId;
        private String token;
    }

    @Data
    static class NoticeRequest {
        private String title;
        private String message;
        private String audience;
        private String channel;
    }
}
