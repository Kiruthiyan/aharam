package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Notice;
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
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NoticeRepository noticeRepository;

    /**
     * Mobile app calls this on startup to register the device push token.
     */
    @PostMapping("/token")
    public ResponseEntity<?> registerToken(@RequestBody TokenRequest request) {
        notificationService.saveToken(request.getUserId(), request.getToken());
        return ResponseEntity.ok("Token registered.");
    }

    /**
     * Fetch all notification broadcasts (History Tab).
     */
    @GetMapping
    public ResponseEntity<List<Notice>> getNotifications() {
        return ResponseEntity.ok(noticeRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * Compose and send a new broadcast notification.
     * Saves to DB and optionally triggers actual push/WhatsApp logic underneath.
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody NoticeRequest req, Authentication authentication) {
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
        notice.setStatus("SENT"); // PENDING if we queue it, SENT for now

        // If channel is WHATSAPP or BOTH, we would trigger WhatsApp API here
        if ("WHATSAPP".equals(req.getChannel()) || "BOTH".equals(req.getChannel())) {
            // Placeholder: simulate WhatsApp dispatch to 0 users for now until Twilio is
            // connected
            notice.setWhatsappCount(0);
        }

        noticeRepository.save(notice);

        // TODO: Call NotificationService to actually push the notification to the
        // mobile app
        // notificationService.broadcast(notice);

        return ResponseEntity.ok(notice);
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
