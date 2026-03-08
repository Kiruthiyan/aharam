package com.aharam.tuition.service;

import com.aharam.tuition.entity.AuditLog;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.AuditLogRepository;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    public void logAction(String actionType, String targetResource, Long resourceId) {
        AuditLog log = new AuditLog();
        log.setActionType(actionType);
        log.setTargetResource(targetResource);
        log.setResourceId(resourceId);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            User actor = userRepository.findByEmail(auth.getName()).orElse(null);
            log.setActor(actor);
        }

        auditLogRepository.save(log);
    }
}
