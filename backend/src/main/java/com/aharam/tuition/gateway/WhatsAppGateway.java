package com.aharam.tuition.gateway;

/**
 * Gateway interface for WhatsApp notifications.
 * Defines contract for sending messages via WhatsApp platform.
 * 
 * Current implementations:
 * - MockWhatsAppGateway: Logs messages without sending (development/testing)
 * - TwilioWhatsAppGateway: Sends via Twilio API (future implementation)
 */
public interface WhatsAppGateway {
    
    /**
     * Send a WhatsApp message to the specified phone number.
     * 
     * @param phoneNumber The recipient's phone number in E.164 format (e.g., +94701234567)
     * @param message The message content to send
     * @return true if message was sent successfully, false otherwise
     * @throws IllegalArgumentException if phoneNumber or message is invalid
     */
    boolean sendMessage(String phoneNumber, String message);
    
    /**
     * Check if the gateway is configured and ready to send messages.
     * 
     * @return true if gateway is ready to send, false if missing credentials or not configured
     */
    boolean isConfigured();
    
    /**
     * Get the name of this WhatsApp gateway implementation.
     * 
     * @return implementation name (e.g., "Twilio", "Mock", etc.)
     */
    String getProviderName();
}
