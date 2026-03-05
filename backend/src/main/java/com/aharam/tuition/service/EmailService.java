package com.aharam.tuition.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp, String context) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Aharam - " + context + " Verification Code");
        message.setText("Hello,\n\nYour verification code for " + context + " is: " + otp + "\n\nThis code is valid for 15 minutes.\n\nRegards,\nAharam Admin");
        
        try {
            mailSender.send(message);
            System.out.println("OTP Email sent successfully to " + toEmail + " (OTP: " + otp + ")");
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ". Reason: " + e.getMessage());
            // For dev environments without SMTP setup, just print it:
            System.out.println("--- DEV MODE: OTP IS " + otp + " ---");
        }
    }

    public void sendWelcomeEmail(String toEmail, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Welcome to Aharam Tuition Management System");
        message.setText("Hello,\n\nAn administrator has created an account for you.\n\n" +
                "Login URL: http://localhost:3000/login\n" +
                "Email: " + toEmail + "\n" +
                "Temporary Password: " + tempPassword + "\n\n" +
                "You will be required to change this password upon your first login.\n\nRegards,\nAharam Admin");

        try {
            mailSender.send(message);
            System.out.println("Welcome Email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to " + toEmail + ". Reason: " + e.getMessage());
            System.out.println("--- DEV MODE: TEMP PASSWORD IS " + tempPassword + " ---");
        }
    }
}
