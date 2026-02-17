package com.example.eventura.controller;

import com.example.eventura.entity.Payment;
import com.example.eventura.repository.PaymentRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final PaymentRepository paymentRepository;

    @GetMapping("/earnings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EarningsStats> getEarningsStats() {
        Double totalEarnings = paymentRepository.sumPlatformFeeByStatus(Payment.PaymentStatus.RELEASED);
        Double pendingEscrow = paymentRepository.sumAmountByStatus(Payment.PaymentStatus.ESCROWED);
        Double totalPayouts = paymentRepository.sumProviderAmountByStatus(Payment.PaymentStatus.RELEASED);

        return ResponseEntity.ok(EarningsStats.builder()
                .totalEarnings(totalEarnings != null ? totalEarnings : 0.0)
                .pendingEscrow(pendingEscrow != null ? pendingEscrow : 0.0)
                .totalPayouts(totalPayouts != null ? totalPayouts : 0.0)
                .build());
    }

    @Data
    @Builder
    public static class EarningsStats {
        private Double totalEarnings;
        private Double pendingEscrow;
        private Double totalPayouts;
    }
}
