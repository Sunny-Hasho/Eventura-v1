package com.example.eventura.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "Payments")
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "request_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ServiceRequest request;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "transaction_id")
    private String transactionId;

    // Stripe fields for payment integration
    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "stripe_transfer_id")
    private String stripeTransferId;

    @Column(name = "platform_fee")
    private Double platformFee; // Commission taken by Eventura

    @Column(name = "provider_amount")
    private Double providerAmount; // Amount provider receives after commission

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void setUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum PaymentStatus {
        AWAITING_PAYMENT,  // Pitch accepted, waiting for client to pay
        ESCROWED,          // Money received, held in platform account
        PENDING_RELEASE,   // Provider marked work complete, awaiting client approval
        RELEASED,          // Payment transferred to provider
        REFUNDED,          // Money returned to client
        DISPUTED,          // Under admin review
        EXPIRED            // Client didn't pay within time limit
    }
}