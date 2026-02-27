package com.aharam.tuition.service;

import com.aharam.tuition.entity.PushToken;
import com.aharam.tuition.repository.PushTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
     * Send WhatsApp-style push notification to a specific user.
     */
    public void sendToUser(String userId, String title, String body) {
        List<PushToken> tokens = pushTokenRepository.findByUserId(userId);
        if (tokens.isEmpty()) {
            System.out.println("[Push] No tokens for user: " + userId);
            return;
        }
        for (PushToken pt : tokens) {
            sendPush(pt.getToken(), title, body);
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
