package com.aharam.tuition.service;

import com.aharam.tuition.entity.NotificationLog;
import com.aharam.tuition.entity.PushToken;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.gateway.WhatsAppGateway;
import com.aharam.tuition.notification.NotificationGateway;
import com.aharam.tuition.repository.NotificationLogRepository;
import com.aharam.tuition.repository.PushTokenRepository;
import com.aharam.tuition.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private PushTokenRepository pushTokenRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private NotificationGateway notificationGateway;
    
    @Autowired(required = false)
    private WhatsAppGateway whatsAppGateway;

    public void saveToken(String userId, String token) {
        if (pushTokenRepository.existsByToken(token)) {
            return;
        }
        PushToken pt = new PushToken();
        pt.setUserId(userId);
        pt.setToken(token);
        pushTokenRepository.save(pt);
    }

    @Async
    public void sendToUser(String userId, String title, String body, String module) {
        Student student = studentRepository.findById(userId).orElse(null);
        String whatsappNumber = student != null && student.getWhatsappNumber() != null ? student.getWhatsappNumber() : userId;
        
        // Send via WhatsApp if number is available
        if (whatsappNumber != null && !whatsappNumber.trim().isEmpty()) {
            sendViaWhatsApp(student, whatsappNumber, title, body, module);
        }
        
        // Also send push notifications to mobile app
        sendViaPush(userId, title, body);
    }
    
    /**
     * Send notification via WhatsApp using WhatsAppGateway.
     */
    private void sendViaWhatsApp(Student student, String whatsappNumber, String title, String body, String module) {
        NotificationLog logEntry = new NotificationLog();
        logEntry.setStudent(student);
        logEntry.setModule(module != null ? module : "CUSTOM");
        logEntry.setChannel("WHATSAPP");
        logEntry.setTargetNumber(whatsappNumber);
        logEntry.setMessageContent(title + "\n\n" + body);
        
        try {
            if (whatsAppGateway == null || !whatsAppGateway.isConfigured()) {
                logEntry.setStatus("SKIPPED");
                logEntry.setErrorReason("WhatsApp gateway not configured");
                notificationLogRepository.save(logEntry);
                log.info("WhatsApp gateway not configured, skipping message to {}", whatsappNumber);
                return;
            }
            
            logEntry.setStatus("PENDING");
            logEntry = notificationLogRepository.save(logEntry);
            
            String messageContent = title;
            if (body != null && !body.isEmpty()) {
                messageContent += "\n\n" + body;
            }
            
            if (whatsAppGateway.sendMessage(whatsappNumber, messageContent)) {
                logEntry.setStatus("SENT");
                logEntry.setCompletedAt(LocalDateTime.now());
            } else {
                logEntry.setStatus("FAILED");
                logEntry.setErrorReason("WhatsApp gateway failed to send");
            }
            
            notificationLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("WhatsApp notification failed for number={}", whatsappNumber, e);
            logEntry.setStatus("FAILED");
            logEntry.setErrorReason(e.getMessage() == null ? "WhatsApp send failed" : e.getMessage());
            notificationLogRepository.save(logEntry);
        }
    }
    
    /**
     * Send push notifications to mobile app via Expo or Firebase.
     */
    private void sendViaPush(String userId, String title, String body) {
        try {
            List<PushToken> tokens = pushTokenRepository.findByUserId(userId);
            for (PushToken pt : tokens) {
                try {
                    notificationGateway.sendPush(pt.getToken(), title, body);
                } catch (Exception e) {
                    log.warn("Push notification failed for token={}", pt.getToken(), e);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to send push notifications for userId={}", userId, e);
        }
    }
}
