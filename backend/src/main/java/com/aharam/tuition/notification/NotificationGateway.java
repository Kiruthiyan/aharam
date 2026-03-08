package com.aharam.tuition.notification;

public interface NotificationGateway {
    void sendPush(String token, String title, String body);
}
