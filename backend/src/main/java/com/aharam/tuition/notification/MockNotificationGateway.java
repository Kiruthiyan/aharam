package com.aharam.tuition.notification;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
@ConditionalOnProperty(name = "notification.provider", havingValue = "mock", matchIfMissing = true)
public class MockNotificationGateway implements NotificationGateway {

    private final List<String> sentPayloads = Collections.synchronizedList(new ArrayList<>());

    @Override
    public void sendPush(String token, String title, String body) {
        sentPayloads.add(token + "|" + title + "|" + body);
    }

    public List<String> getSentPayloads() {
        return List.copyOf(sentPayloads);
    }

    public void clear() {
        sentPayloads.clear();
    }
}
