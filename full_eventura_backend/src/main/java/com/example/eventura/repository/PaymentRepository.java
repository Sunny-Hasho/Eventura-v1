package com.example.eventura.repository;

import com.example.eventura.entity.Payment;
import com.example.eventura.entity.ServiceRequest;
import com.example.eventura.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findByClient(User client, Pageable pageable);
    Page<Payment> findByProvider(User provider, Pageable pageable);
    Optional<Payment> findTopByRequestOrderByCreatedAtDesc(ServiceRequest request);
    Optional<Payment> findByRequest(ServiceRequest request);
    Page<Payment> findByPaymentStatus(Payment.PaymentStatus status, Pageable pageable);
    @Query("SELECT SUM(p.platformFee) FROM Payment p WHERE p.paymentStatus = :status")
    Double sumPlatformFeeByStatus(@Param("status") Payment.PaymentStatus status);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = :status")
    Double sumAmountByStatus(@Param("status") Payment.PaymentStatus status);

    @Query("SELECT SUM(p.providerAmount) FROM Payment p WHERE p.paymentStatus = :status")
    Double sumProviderAmountByStatus(@Param("status") Payment.PaymentStatus status);
}