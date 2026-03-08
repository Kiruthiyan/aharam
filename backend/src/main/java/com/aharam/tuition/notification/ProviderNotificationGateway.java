package com.aharam.tuition.notification;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
@Profile("!test")
@ConditionalOnProperty(name = "notification.provider", havingValue = "provider", matchIfMissing = true)
public class ProviderNotificationGateway implements NotificationGateway {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public void sendPush(String expoPushToken, String title, String body) {
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
            System.out.println("[Push] Sent to " + expoPushToken + " -> " + response.statusCode() + " " + response.body());
        } catch (Exception e) {
            System.err.println("[Push] Failed to send notification: " + e.getMessage());
        }
    }

    private String escapeJson(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
