package com.example.eventura.service;

import com.example.eventura.dto.request.PitchRequest;
import com.example.eventura.dto.response.PitchResponse;
import com.example.eventura.entity.Pitch;
import com.example.eventura.entity.ServiceRequest;
import com.example.eventura.entity.User;
import com.example.eventura.exception.ResourceNotFoundException;
import com.example.eventura.exception.UnauthorizedException;
import com.example.eventura.repository.PitchRepository;
import com.example.eventura.repository.ServiceRequestRepository;
import com.example.eventura.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PitchService {

    private final PitchRepository pitchRepository;
    private final UserRepository userRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final NotificationService notificationService;
    private final WebSocketEventService webSocketEventService;
    private final PaymentService paymentService;

    private static final Double PLATFORM_FEE_PERCENTAGE = 10.0; // 10% platform commission

    public PitchResponse createPitch(Long providerId, PitchRequest request) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (!provider.getRole().equals(User.Role.PROVIDER)) {
            throw new UnauthorizedException("Only providers can create pitches");
        }

        ServiceRequest serviceRequest = serviceRequestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));

        Pitch pitch = new Pitch();
        pitch.setRequest(serviceRequest);
        pitch.setProvider(provider);
        pitch.setMessage(request.getPitchDetails());
        pitch.setProposedPrice(request.getProposedPrice());
        pitch.setStatus(Pitch.Status.PENDING);

        Pitch savedPitch = pitchRepository.save(pitch);

        // Notify the client
        User client = serviceRequest.getClient();
        String message = String.format("New pitch from %s %s for your service request: %s",
                provider.getFirstName(), provider.getLastName(), serviceRequest.getTitle());
        notificationService.createNotification(client, message);

        // Broadcast pitch creation for dashboard auto-update
        webSocketEventService.broadcastPitchChange("CREATED");

        return convertToResponse(savedPitch);
    }

    public Page<PitchResponse> getMyPitches(Long providerId, Pageable pageable) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (!provider.getRole().equals(User.Role.PROVIDER)) {
            throw new UnauthorizedException("Only providers can view their own pitches");
        }

        return pitchRepository.findByProvider(provider, pageable)
                .map(this::convertToResponse);
    }

    public PitchResponse getPitch(Long pitchId) {
        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new ResourceNotFoundException("Pitch not found"));
        return convertToResponse(pitch);
    }

    public Page<PitchResponse> getPitchesForRequest(Long requestId, Pageable pageable) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));

        return pitchRepository.findByRequest(serviceRequest, pageable)
                .map(this::convertToResponse);
    }

    public PitchResponse updatePitchStatus(Long pitchId, Long userId, Pitch.Status status) {
        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new ResourceNotFoundException("Pitch not found"));

        // Check if the user is the client who owns the service request
        ServiceRequest serviceRequest = pitch.getRequest();
        if (!serviceRequest.getClient().getId().equals(userId)) {
            throw new UnauthorizedException("Only the client who created the service request can update pitch status");
        }

        pitch.setStatus(status);
        Pitch updatedPitch = pitchRepository.save(pitch);

        // Notify the provider
        User provider = pitch.getProvider();
        String message = String.format("Your pitch for service request: %s has been marked as %s",
                serviceRequest.getTitle(), status);
        notificationService.createNotification(provider, message);

        return convertToResponse(updatedPitch);
    }

    public void deletePitch(Long pitchId, Long userId) {
        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new ResourceNotFoundException("Pitch not found"));

        // Check if the user is the provider who created the pitch
        if (!pitch.getProvider().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to delete this pitch");
        }

        pitchRepository.delete(pitch);

        // Optionally notify the client
        User client = pitch.getRequest().getClient();
        String message = String.format("Pitch from %s %s for your service request: %s has been withdrawn",
                pitch.getProvider().getFirstName(), pitch.getProvider().getLastName(),
                pitch.getRequest().getTitle());
        notificationService.createNotification(client, message);
    }

    /**
     * Accept a pitch and create escrow payment
     * This is the NEW flow that replaces direct assignment
     */
    public PitchResponse acceptPitch(Long pitchId, Long clientId) {
        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new ResourceNotFoundException("Pitch not found"));

        ServiceRequest serviceRequest = pitch.getRequest();

        /// Verify the user is the client who owns the request
        if (!serviceRequest.getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("Only the client who created the request can accept pitches");
        }

        // Verify request is still open
        if (serviceRequest.getStatus() != ServiceRequest.Status.OPEN) {
            throw new IllegalStateException("Request is not accepting pitches");
        }

        // Update pitch status to ACCEPTED (not PAID yet - waiting for payment)
        pitch.setStatus(Pitch.Status.ACCEPTED);
        Pitch acceptedPitch = pitchRepository.save(pitch);

        // Reject all other pitches for this request
        pitchRepository.findByRequest(serviceRequest, Pageable.unpaged())
                .stream()
                .filter(p -> !p.getId().equals(pitchId) && p.getStatus() == Pitch.Status.PENDING)
                .forEach(p -> {
                    p.setStatus(Pitch.Status.REJECTED);
                    pitchRepository.save(p);
                    
                    // Notify rejected providers
                    String rejectMsg = String.format("Your pitch for request: %s was not selected",
                            serviceRequest.getTitle());
                    notificationService.createNotification(p.getProvider(), rejectMsg);
                });

        // Assign provider to the request and update status to ASSIGNED
        User provider = pitch.getProvider();
        serviceRequest.setAssignedProvider(provider);
        serviceRequest.setAssignedPrice(pitch.getProposedPrice());
        serviceRequest.setStatus(ServiceRequest.Status.ASSIGNED);
        serviceRequestRepository.save(serviceRequest);

        // Create escrow payment (status = AWAITING_PAYMENT)
        paymentService.createEscrowPayment(
                serviceRequest.getId(),
                provider.getId(),
                pitch.getProposedPrice(),
                PLATFORM_FEE_PERCENTAGE
        );

        // Notify accepted provider
        String providerMsg = String.format(
                "Your pitch of Rs %s was accepted! Waiting for client payment to start work.",
                pitch.getProposedPrice()
        );
        notificationService.createNotification(provider, providerMsg);

        webSocketEventService.broadcastPitchChange("ACCEPTED");

        return convertToResponse(acceptedPitch);
    }

    private PitchResponse convertToResponse(Pitch pitch) {
        PitchResponse response = new PitchResponse();
        response.setId(pitch.getId());
        response.setRequestId(pitch.getRequest().getId());
        response.setProviderId(pitch.getProvider().getId());
        response.setPitchDetails(pitch.getMessage());
        response.setProposedPrice(pitch.getProposedPrice());
        response.setCreatedAt(pitch.getCreatedAt());
        response.setStatus(pitch.getStatus());
        return response;
    }
}