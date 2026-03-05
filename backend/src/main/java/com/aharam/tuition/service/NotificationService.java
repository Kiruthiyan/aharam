package com.aharam.tuition.service;

import com.aharam.tuition.entity.PushToken;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.NotificationLog;
import com.aharam.tuition.repository.NotificationLogRepository;
import com.aharam.tuition.repository.PushTokenRepository;
import com.aharam.tuition.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private PushTokenRepository pushTokenRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private StudentRepository studentRepository;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Save or update the Expo push token for a user (student ID or username).
     */
    public void saveToken(String userId, String token) {
        if (pushTokenRepository.existsByToken(token))
            return;
        PushToken pt = new PushToken();
        pt.setUserId(userId);
        pt.setToken(token);
        pushTokenRepository.save(pt);
        System.out.println("[Push] Registered token for " + userId + ": " + token);
    }

    /**
     * Send WhatsApp-style push notification to a specific user asynchronously.
     */
    @Async
    public void sendToUser(String userId, String title, String body, String module) {
        Student student = studentRepository.findById(userId).orElse(null);

        NotificationLog log = new NotificationLog();
        log.setStudent(student);
        log.setModule(module != null ? module : "CUSTOM");
        log.setChannel("WHATSAPP");
        log.setTargetNumber(
                student != null && student.getWhatsappNumber() != null ? student.getWhatsappNumber() : userId);
        log.setMessageContent(title + "\n\n" + body);

        try {
            // Log as pending
            log.setStatus("PENDING");
            log = notificationLogRepository.save(log);

            // Execute the push/whatsapp send logic
            List<PushToken> tokens = pushTokenRepository.findByUserId(userId);
            if (tokens.isEmpty()) {
                System.out.println("[Push] No tokens for user: " + userId + " (simulating WhatsApp send)");
            } else {
                for (PushToken pt : tokens) {
                    sendPush(pt.getToken(), title, body);
                }
            }

            // Mark successful
            log.setStatus("SENT");
            log.setCompletedAt(java.time.LocalDateTime.now());
            notificationLogRepository.save(log);

        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setErrorReason(e.getMessage());
            notificationLogRepository.save(log);
        }
    }

    /**
     * Core: HTTP call to Expo Push API (like WhatsApp FCM gateway)
     */
    private void sendPush(String expoPushToken, String title, String body) {
        try {
            String json = String.format(
                    "{\"to\":\"%s\",\"sound\":\"default\",\"title\":\"%s\",\"body\":\"%s\",\"priority\":\"high\"}",
                    expoPushToken, escapeJson(title), escapeJson(body));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://exp.host/--/api/v2/push/send"))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out
                    .println("[Push] Sent to " + expoPushToken + " → " + response.statusCode() + " " + response.body());
        } catch (Exception e) {
            System.err.println("[Push] Failed to send notification: " + e.getMessage());
        }
    }

    private String escapeJson(String s) {
        if (s == null)
            return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
