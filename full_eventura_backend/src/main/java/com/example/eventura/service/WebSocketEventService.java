package com.example.eventura.service;

import com.example.eventura.dto.response.NotificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for broadcasting real-time events via WebSocket.
 * Sends updates to:
 * - Individual users (notifications)
 * - All admins (dashboard stats updates)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send notification to a specific user
     */
    public void sendNotificationToUser(String userEmail, NotificationResponse notification) {
        log.debug("Sending notification to user: {}", userEmail);
        messagingTemplate.convertAndSendToUser(
            userEmail,
            "/queue/notifications",
            notification
        );
    }

    /**
     * Broadcast dashboard stats update to all connected clients
     * This is triggered when users, requests, or providers change
     */
    public void broadcastDashboardUpdate(String entityType, String action) {
        log.debug("Broadcasting dashboard update: {} - {}", entityType, action);
        Map<String, Object> update = new HashMap<>();
        update.put("entityType", entityType);
        update.put("action", action);
        update.put("timestamp", System.currentTimeMillis());
        
        messagingTemplate.convertAndSend("/topic/dashboard-updates", update);
    }

    /**
     * Broadcast when a new user registers
     */
    public void broadcastUserChange(String action) {
        broadcastDashboardUpdate("USER", action);
    }

    /**
     * Broadcast when a service request is created/updated
     */
    public void broadcastRequestChange(String action) {
        broadcastDashboardUpdate("REQUEST", action);
    }

    /**
     * Broadcast when a provider is created/updated/verified
     */
    public void broadcastProviderChange(String action) {
        broadcastDashboardUpdate("PROVIDER", action);
    }

    /**
     * Broadcast when a pitch is created/accepted
     */
    public void broadcastPitchChange(String action) {
        broadcastDashboardUpdate("PITCH", action);
    }

    /**
     * Broadcast when a payment status changes
     */
    public void broadcastPaymentChange(String action) {
        broadcastDashboardUpdate("PAYMENT", action);
    }
}
