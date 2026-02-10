package com.example.eventura.service;

import com.example.eventura.dto.request.PaymentRequest;
import com.example.eventura.dto.response.PaymentResponse;
import com.example.eventura.entity.Payment;
import com.example.eventura.entity.ServiceRequest;
import com.example.eventura.entity.User;
import com.example.eventura.exception.ResourceNotFoundException;
import com.example.eventura.exception.UnauthorizedException;
import com.example.eventura.repository.PaymentRepository;
import com.example.eventura.repository.ServiceRequestRepository;
import com.example.eventura.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final NotificationService notificationService;
    private final WebSocketEventService webSocketEventService;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PaymentService.class);

    public PaymentResponse createPayment(PaymentRequest request, String email) {
        User client = userRepository.findByEmail(email);
        if (client == null || !client.getRole().equals(User.Role.CLIENT)) {
            throw new UnauthorizedException("Only clients can create payments");
        }

        ServiceRequest serviceRequest = serviceRequestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));

        if (!serviceRequest.getClient().getId().equals(client.getId())) {
            throw new UnauthorizedException("Not authorized to create payment for this request");
        }

        if (serviceRequest.getAssignedProvider() == null) {
            throw new ResourceNotFoundException("No provider assigned to this request");
        }

        Payment payment = new Payment();
        payment.setRequest(serviceRequest);
        payment.setClient(client);
        payment.setProvider(serviceRequest.getAssignedProvider());
        payment.setAmount(request.getAmount());
        payment.setPaymentStatus(Payment.PaymentStatus.AWAITING_PAYMENT);

        Payment savedPayment = paymentRepository.save(payment);

        return convertToResponse(savedPayment);
    }

    public Page<PaymentResponse> getPaymentsByClient(String email, Pageable pageable) {
        User client = userRepository.findByEmail(email);
        if (client == null) {
            throw new ResourceNotFoundException("Client not found");
        }

        return paymentRepository.findByClient(client, pageable)
                .map(this::convertToResponse);
    }

    public Page<PaymentResponse> getPaymentsByProvider(String email, Pageable pageable) {
        User provider = userRepository.findByEmail(email);
        if (provider == null) {
            throw new ResourceNotFoundException("Provider not found");
        }

        return paymentRepository.findByProvider(provider, pageable)
                .map(this::convertToResponse);
    }

    public PaymentResponse getPaymentStatus(Long paymentId, String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getClient().getId().equals(user.getId()) && !payment.getProvider().getId().equals(user.getId())) {
            throw new UnauthorizedException("Not authorized to view this payment status");
        }

        return convertToResponse(payment);
    }

    public PaymentResponse updatePaymentStatus(Long paymentId, String email, Payment.PaymentStatus status) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        logger.info("Payment updated status: {}", status);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getClient().getId().equals(user.getId())) {
            throw new UnauthorizedException("Only the client can update payment status");
        }

        payment.setPaymentStatus(status);
        Payment updatedPayment = paymentRepository.save(payment);

        if (status == Payment.PaymentStatus.RELEASED) {
            User provider = payment.getProvider();
            User client = payment.getClient();
            ServiceRequest request = payment.getRequest();

            logger.info("Processing completion messages for payment {}", paymentId);
            // Notify provider
            String providerMessage = String.format("You received a payment of Rs %s for service request: %s from %s %s",
                    payment.getAmount(), request.getTitle(), client.getFirstName(), client.getLastName());
            notificationService.createNotification(provider, providerMessage);

            // Notify client
            String clientMessage = String.format("Your payment of Rs %s for service request: %s was successful",
                    payment.getAmount(), request.getTitle());
            notificationService.createNotification(client, clientMessage);
            
            // Broadcast payment completion for dashboard auto-update
            webSocketEventService.broadcastPaymentChange("COMPLETED");
        }

        return convertToResponse(updatedPayment);
    }

    public PaymentResponse getPaymentStatusByRequestId(Long requestId, String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));

        if (!serviceRequest.getClient().getId().equals(user.getId()) &&
                (serviceRequest.getAssignedProvider() == null ||
                        !serviceRequest.getAssignedProvider().getId().equals(user.getId()))) {
            throw new UnauthorizedException("Not authorized to view payment status for this request");
        }

        Payment payment = paymentRepository.findTopByRequestOrderByCreatedAtDesc(serviceRequest)
                .orElseThrow(() -> new ResourceNotFoundException("No payment found for this service request"));

        return convertToResponse(payment);
    }

    private PaymentResponse convertToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setRequestId(payment.getRequest().getId());
        response.setClientId(payment.getClient().getId());
        response.setProviderId(payment.getProvider().getId());
        response.setAmount(payment.getAmount());
        response.setPaymentStatus(payment.getPaymentStatus().name());
        response.setTransactionId(payment.getTransactionId());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }

    // ==================== NEW ESCROW PAYMENT METHODS ====================

    /**
     * Create escrow payment when pitch is accepted
     * Status: AWAITING_PAYMENT
     */
    public PaymentResponse createEscrowPayment(Long requestId, Long providerId, Double amount, Double platformFeePercentage) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));

        // Check if payment already exists for this request
        if (paymentRepository.findByRequest(serviceRequest).isPresent()) {
            throw new IllegalStateException("Payment already exists for this request");
        }

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        User client = serviceRequest.getClient();
        
        if (client == null) {
            throw new IllegalStateException("Service request has no associated client");
        }

        // Calculate platform fee and provider amount
        Double platformFee = amount * (platformFeePercentage / 100.0);
        Double providerAmount = amount - platformFee;

        Payment payment = new Payment();
        payment.setRequest(serviceRequest);
        payment.setClient(client);
        payment.setProvider(provider);
        payment.setAmount(amount);
        payment.setPlatformFee(platformFee);
        payment.setProviderAmount(providerAmount);
        payment.setPaymentStatus(Payment.PaymentStatus.AWAITING_PAYMENT);

        Payment savedPayment = paymentRepository.save(payment);

        // Notify client to pay
        String message = String.format("Please complete payment of Rs %s to confirm provider %s %s",
                amount, provider.getFirstName(), provider.getLastName());
        notificationService.createNotification(client, message);

        logger.info("Escrow payment created: {} (Awaiting payment from client)", savedPayment.getId());

        return convertToResponse(savedPayment);
    }

    /**
     * Mark payment as paid (money is now escrowed)
     * Status: AWAITING_PAYMENT -> ESCROWED
     */
    public PaymentResponse markAsPaid(Long paymentId, String email, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        User client = userRepository.findByEmail(email);
        if (!payment.getClient().getId().equals(client.getId())) {
            throw new UnauthorizedException("Only the client can confirm payment");
        }

        if (payment.getPaymentStatus() != Payment.PaymentStatus.AWAITING_PAYMENT) {
            throw new IllegalStateException("Payment is not awaiting payment");
        }

        payment.setPaymentStatus(Payment.PaymentStatus.ESCROWED);
        payment.setTransactionId(transactionId);
        Payment updatedPayment = paymentRepository.save(payment);

        // Notify provider
        User provider = payment.getProvider();
        ServiceRequest request = payment.getRequest();
        String message = String.format("Payment of Rs %s has been secured for request: %s. You can start work!",
                payment.getAmount(), request.getTitle());
        notificationService.createNotification(provider, message);

        // Update request status to ASSIGNED
        request.setStatus(ServiceRequest.Status.ASSIGNED);
        serviceRequestRepository.save(request);

        webSocketEventService.broadcastPaymentChange("ESCROWED");
        logger.info("Payment {} is now ESCROWED", paymentId);

        return convertToResponse(updatedPayment);
    }

    /**
     * Release payment to provider after work approval
     * Status: PENDING_RELEASE -> RELEASED
     */
    public Page<PaymentResponse> getAllPayments(String status, Pageable pageable) {
        if (status != null && !status.isEmpty()) {
            return paymentRepository.findByPaymentStatus(Payment.PaymentStatus.valueOf(status.toUpperCase()), pageable)
                    .map(this::convertToResponse);
        }
        return paymentRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    /**
     * Release payment to provider after work approval (or Admin decision)
     * Status: PENDING_RELEASE -> RELEASED
     */
    public PaymentResponse releasePayment(Long paymentId, String email) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        User user = userRepository.findByEmail(email);
        
        // Allow Client OR Admin to release payment
        boolean isClient = payment.getClient().getId().equals(user.getId());
        boolean isAdmin = user.getRole().equals(User.Role.ADMIN);

        if (!isClient && !isAdmin) {
            throw new UnauthorizedException("Only the client or admin can release payment");
        }

        if (payment.getPaymentStatus() != Payment.PaymentStatus.PENDING_RELEASE) {
            throw new IllegalStateException("Payment is not pending release");
        }

        payment.setPaymentStatus(Payment.PaymentStatus.RELEASED);
        Payment releasedPayment = paymentRepository.save(payment);

        // Update request status to COMPLETED
        ServiceRequest request = payment.getRequest();
        request.setStatus(ServiceRequest.Status.COMPLETED);
        serviceRequestRepository.save(request);

        // Notify provider
        User provider = payment.getProvider();
        User client = payment.getClient();
        String providerMessage = String.format("Payment of Rs %s has been released! You received Rs %s (after platform fee).",
                payment.getAmount(), payment.getProviderAmount());
        notificationService.createNotification(provider, providerMessage);

        // Notify client
        String clientMessage = String.format("Payment of Rs %s for request: %s has been successfully released to provider.",
                payment.getAmount(), request.getTitle());
        notificationService.createNotification(client, clientMessage);

        webSocketEventService.broadcastPaymentChange("RELEASED");
        logger.info("Payment {} RELEASED to provider", paymentId);

        return convertToResponse(releasedPayment);
    }

    /**
     * Refund payment to client
     * Status: ESCROWED/DISPUTED -> REFUNDED
     */
    public PaymentResponse refundPayment(Long paymentId, Long adminId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (!admin.getRole().equals(User.Role.ADMIN)) {
            throw new UnauthorizedException("Only admins can issue refunds");
        }

        if (payment.getPaymentStatus() != Payment.PaymentStatus.ESCROWED &&
                payment.getPaymentStatus() != Payment.PaymentStatus.DISPUTED) {
            throw new IllegalStateException("Payment cannot be refunded in its current state");
        }

        payment.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
        Payment refundedPayment = paymentRepository.save(payment);

        // Update request status
        ServiceRequest request = payment.getRequest();
        request.setStatus(ServiceRequest.Status.CANCELLED);
        serviceRequestRepository.save(request);

        // Notify both parties
        User client = payment.getClient();
        User provider = payment.getProvider();

        String clientMessage = String.format("Your payment of Rs %s has been refunded. Reason: %s",
                payment.getAmount(), reason);
        notificationService.createNotification(client, clientMessage);

        String providerMessage = String.format("Payment for request: %s has been refunded to client. Reason: %s",
                request.getTitle(), reason);
        notificationService.createNotification(provider, providerMessage);

        webSocketEventService.broadcastPaymentChange("REFUNDED");
        logger.info("Payment {} REFUNDED by admin {}", paymentId, adminId);

        return convertToResponse(refundedPayment);
    }

    /**
     * Dispute a payment (client claims work not done properly)
     * Status: PENDING_RELEASE -> DISPUTED
     */
    public PaymentResponse disputePayment(Long paymentId, String email, String disputeReason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        User client = userRepository.findByEmail(email);
        if (!payment.getClient().getId().equals(client.getId())) {
            throw new UnauthorizedException("Only the client can dispute payment");
        }

        if (payment.getPaymentStatus() != Payment.PaymentStatus.PENDING_RELEASE) {
            throw new IllegalStateException("Payment can only be disputed when pending release");
        }

        payment.setPaymentStatus(Payment.PaymentStatus.DISPUTED);
        Payment disputedPayment = paymentRepository.save(payment);

        // Notify provider and admin
        User provider = payment.getProvider();
        ServiceRequest request = payment.getRequest();

        String providerMessage = String.format("Client has disputed payment for request: %s. Reason: %s. Admin will review.",
                request.getTitle(), disputeReason);
        notificationService.createNotification(provider, providerMessage);

        // TODO: Notify all admins
        webSocketEventService.broadcastPaymentChange("DISPUTED");
        logger.warn("Payment {} DISPUTED by client. Reason: {}", paymentId, disputeReason);

        return convertToResponse(disputedPayment);
    }
}