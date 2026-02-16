package com.example.eventura.controller;

import com.example.eventura.dto.response.NotificationResponse;
import com.example.eventura.dto.response.PortfolioResponse;
import com.example.eventura.dto.response.ProviderResponse;
import com.example.eventura.dto.response.ServiceRequestResponse;
import com.example.eventura.dto.response.UserResponse;
import com.example.eventura.dto.response.VerificationDocumentResponse;
import com.example.eventura.dto.response.ReviewResponse;
import com.example.eventura.dto.response.PaymentResponse;
import com.example.eventura.security.JwtTokenProvider;
import com.example.eventura.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final ProviderService providerService;
    private final RequestService requestService;
    private final ReviewService reviewService;
    private final NotificationService notificationService;
    private final PortfolioService portfolioService;
    private final VerificationDocumentService verificationDocumentService;
    private final PaymentService paymentService;
    private final JwtTokenProvider jwtTokenProvider;

    @PutMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserStatus(@PathVariable Long userId, @RequestBody String status) {
        return ResponseEntity.ok(userService.updateAccountStatus(userId, status));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        // Admin can view any user
        return ResponseEntity.ok(userService.getUserById(userId, userId));
    }

    @PutMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId, @RequestBody com.example.eventura.dto.request.UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserAccount(@PathVariable Long userId) {
        userService.deleteUserAccountByAdmin(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/documents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<VerificationDocumentResponse>> getAllVerificationDocuments(
            @RequestParam(required = false) String status, Pageable pageable) {
        return ResponseEntity.ok(verificationDocumentService.getAllDocuments(status, pageable));
    }

    @PutMapping("/documents/{documentId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VerificationDocumentResponse> updateDocumentStatus(
            @PathVariable Long documentId, @RequestBody String status) {
        return ResponseEntity.ok(providerService.updateDocumentStatus(documentId, status));
    }

    @PutMapping("/portfolios/{portfolioId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PortfolioResponse> updatePortfolioStatus(
            @PathVariable Long portfolioId, @RequestBody String status) {
        return ResponseEntity.ok(portfolioService.updatePortfolioStatus(portfolioId, status));
    }

    @GetMapping("/portfolios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PortfolioResponse>> getAllPortfolios(
            @RequestParam(required = false) String status, Pageable pageable) {
        return ResponseEntity.ok(portfolioService.getAllPortfolios(status, pageable));
    }

    @DeleteMapping("/portfolios/{portfolioId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePortfolio(
            @PathVariable Long portfolioId, @RequestParam String reason) {
        portfolioService.deletePortfolioByAdmin(portfolioId, reason);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reviews/{reviewId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewResponse> updateReviewStatus(
            @PathVariable Long reviewId, @RequestBody String status) {
        return ResponseEntity.ok(reviewService.updateReviewStatus(reviewId, status));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ServiceRequestResponse>> getAllRequests(Pageable pageable) {
        return ResponseEntity.ok(requestService.getAllRequests(pageable, null));
    }

    @DeleteMapping("/requests/{requestId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long requestId, @RequestHeader("Authorization") String authHeader) {
        Long adminId = getUserIdFromToken(authHeader);
        requestService.deleteRequest(requestId, adminId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notifications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<NotificationResponse>> getAllNotifications(Pageable pageable) {
        return ResponseEntity.ok(notificationService.getNotifications(0L, pageable));
    }

    @PutMapping("/providers/{providerId}/verification")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProviderResponse> updateProviderVerificationStatus(
            @PathVariable Long providerId, @RequestBody Boolean isVerified) {
        return ResponseEntity.ok(providerService.updateProviderVerificationStatus(providerId, isVerified));
    }

    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentResponse>> getAllPayments(
            @RequestParam(required = false) String status, Pageable pageable) {
        return ResponseEntity.ok(paymentService.getAllPayments(status, pageable));
    }

    private Long getUserIdFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtTokenProvider.getUserIdFromJWT(token);
    }
}