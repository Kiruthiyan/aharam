package com.aharam.tuition.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Mock implementation of WhatsAppGateway for development and testing.
 * 
 * Logs WhatsApp messages instead of actually sending them.
 * Useful for:
 * - Local development without WhatsApp/Twilio credentials
 * - Testing notification flows
 * - Debugging message content
 * 
 * To use actual WhatsApp sending, implement TwilioWhatsAppGateway
 * and configure whatsapp.provider=twilio in application.yml
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "whatsapp.provider", havingValue = "mock", matchIfMissing = true)
public class MockWhatsAppGateway implements WhatsAppGateway {
    
    @Override
    public boolean sendMessage(String phoneNumber, String message) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            log.warn("MockWhatsAppGateway: Attempted to send message to empty phone number");
            throw new IllegalArgumentException("Phone number cannot be empty");
        }
        
        if (message == null || message.trim().isEmpty()) {
            log.warn("MockWhatsAppGateway: Attempted to send empty message to {}", phoneNumber);
            throw new IllegalArgumentException("Message cannot be empty");
        }
        
        log.info("MockWhatsAppGateway: [SIMULATED] Sending WhatsApp to {}: {}", phoneNumber, message);
        
        // Mock implementation always succeeds
        return true;
    }
    
    @Override
    public boolean isConfigured() {
        // Mock gateway is always "configured" for testing
        return true;
    }
    
    @Override
    public String getProviderName() {
        return "Mock";
    }
}
