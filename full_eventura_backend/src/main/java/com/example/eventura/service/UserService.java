package com.example.eventura.service;

import com.example.eventura.dto.request.LoginRequest;
import com.example.eventura.dto.request.RegisterRequest;
import com.example.eventura.dto.request.UpdateUserRequest;
import com.example.eventura.dto.response.UserResponse;
import com.example.eventura.entity.User;
import com.example.eventura.exception.ResourceConflictException;
import com.example.eventura.exception.ResourceNotFoundException;
import com.example.eventura.exception.UnauthorizedException;
import com.example.eventura.repository.UserRepository;
import com.example.eventura.security.JwtTokenProvider;
import jakarta.mail.MessagingException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.eventura.dto.request.VerifyOtpRequest;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final GoogleAuthService googleAuthService;

    public UserResponse register(RegisterRequest request) {
        User existingUser = userRepository.findByEmail(request.getEmail());
        
        if (existingUser != null) {
            if (existingUser.isEmailVerified()) {
                throw new ResourceConflictException("Email already exists");
            }
            // If user exists but NOT verified, we treat it as a re-register/retry
            // Update details and resend OTP
            existingUser.setFirstName(request.getFirstName());
            existingUser.setLastName(request.getLastName());
            existingUser.setMobileNumber(request.getMobileNumber());
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
            existingUser.setRole(request.getRole());
            // Reset OTP
            String otp = String.format("%06d", new Random().nextInt(999999));
            existingUser.setOtp(otp);
            existingUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
            
            User savedUser = userRepository.save(existingUser);
            
            // Resend OTP email
            try {
                emailService.sendOtpEmail(savedUser.getEmail(), "Verify your Account", savedUser.getFirstName(), otp);
            } catch (MessagingException e) {
                logger.error("Failed to resend OTP email to {}: {}", savedUser.getEmail(), e.getMessage());
            }
            
            return convertToResponse(savedUser);
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setMobileNumber(request.getMobileNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        
        // Generate OTP for immediate verification/login after registration
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        User savedUser = userRepository.save(user);

        // Send OTP email
        try {
            emailService.sendOtpEmail(savedUser.getEmail(), "Verify your Account", savedUser.getFirstName(), otp);
        } catch (MessagingException e) {
            logger.error("Failed to send OTP email during registration to {}: {}", savedUser.getEmail(), e.getMessage());
            // We still return success for registration, user will just have to resend/login or contact support if they didn't get it.
            // Or maybe throw? For now, log is fine.
        }

        return convertToResponse(savedUser);
    }

    public String initiateLogin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5)); // Valid for 5 minutes
        userRepository.save(user);

        // Send OTP via email
        try {
            emailService.sendOtpEmail(user.getEmail(), "Your OTP Code", user.getFirstName(), otp);
        } catch (MessagingException e) {
            logger.error("Failed to send OTP email to {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send OTP. Please try again later.");
        }

        return "OTP_SENT";
    }

    public String verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null) {
            throw new UnauthorizedException("User not found");
        }

        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new UnauthorizedException("No OTP was requested");
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new UnauthorizedException("OTP has expired");
        }

        if (!user.getOtp().equals(request.getOtp())) {
            throw new UnauthorizedException("Invalid OTP");
        }

        // Clear OTP after successful verification
        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setEmailVerified(true);
        userRepository.save(user);

        return jwtTokenProvider.generateToken(user);
    }
    
    // Kept for backward compatibility if needed, or redirecting to new flow
    // But since we are changing the flow, let's rename the original to match the controller call if we didn't change controller yet.
    // Ideally update controller to call initiateLogin.
    public String login(LoginRequest request) {
        return initiateLogin(request);
    }

    public UserResponse updateAccountStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate and normalize status input
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }

        // Strip JSON quotes if present (e.g., "\"SUSPENDED\"" -> "SUSPENDED")
        String cleanedStatus = status.trim();
        if (cleanedStatus.startsWith("\"") && cleanedStatus.endsWith("\"")) {
            cleanedStatus = cleanedStatus.substring(1, cleanedStatus.length() - 1).trim();
        }

        // Normalize to uppercase
        String normalizedStatus = cleanedStatus.toUpperCase();

        // Validate status
        try {
            User.AccountStatus newStatus = User.AccountStatus.valueOf(normalizedStatus);
            // Optional: Enforce state transition rules (uncomment if desired)

            if (user.getAccountStatus() == User.AccountStatus.DELETED) {
                throw new IllegalStateException("Cannot change status of a DELETED account");
            }
            user.setAccountStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status + ". Must be one of: ACTIVE, SUSPENDED, DELETED");
        }

        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    public void deleteOwnAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setAccountStatus(User.AccountStatus.DELETED);
        userRepository.save(user);
    }
    //only change the status
//    public void deleteUserAccountByAdmin(Long userId) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//
//        user.setAccountStatus(User.AccountStatus.DELETED);
//        userRepository.save(user);
//    }
    public void deleteUserAccountByAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Delete the user completely from the database
        userRepository.delete(user);
    }

    public UserResponse getUserById(Long userId, Long requestingUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Authorization check: Only the user themselves or an admin can access
        // User requestingUser = userRepository.findById(requestingUserId)
        //         .orElseThrow(() -> new ResourceNotFoundException("Requesting user not found"));

//        if (!userId.equals(requestingUserId) && !requestingUser.getRole().equals(User.Role.ADMIN)) {
//            throw new UnauthorizedException("Not authorized to access this user's information");
//        }

        return convertToResponse(user);
    }

    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate email uniqueness if changed
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()) != null) {
                throw new ResourceConflictException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        // Validate mobile number uniqueness if changed
        if (request.getMobileNumber() != null && !request.getMobileNumber().equals(user.getMobileNumber())) {
            if (userRepository.findByMobileNumber(request.getMobileNumber()) != null) {
                throw new ResourceConflictException("Mobile number already exists");
            }
            user.setMobileNumber(request.getMobileNumber());
        }

        // Update other fields if provided
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updatedUser = userRepository.save(user);

        // Optionally send email notification for profile update
        try {
            emailService.sendProfileUpdateEmail(updatedUser.getEmail(), "Profile Updated",
                    updatedUser.getFirstName(), updatedUser.getLastName());
        } catch (MessagingException e) {
            logger.error("Failed to send profile update email to {}: {}", updatedUser.getEmail(), e.getMessage());
        }

        return convertToResponse(updatedUser);
    }


    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::convertToResponse);
    }



    /**
     * Google Login - For EXISTING users only.
     * Throws ResourceNotFoundException if user doesn't exist (they need to sign up first).
     */
    public String processGoogleLogin(String idTokenString) {
        try {
            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = googleAuthService.verifyToken(idTokenString);
            String email = payload.getEmail();
            
            User user = userRepository.findByEmail(email);
            if (user == null) {
                throw new ResourceNotFoundException("No account found with this email. Please sign up first.");
            }
            
            return jwtTokenProvider.generateToken(user);
        } catch (ResourceNotFoundException e) {
            throw e; // Re-throw ResourceNotFoundException as-is
        } catch (Exception e) {
            logger.error("Google Login Failed", e);
            throw new UnauthorizedException("Invalid Google Token");
        }
    }

    /**
     * Google Sign Up - For NEW users only.
     * Creates a new account with the specified role.
     * Throws ResourceConflictException if user already exists.
     */
    public String processGoogleSignUp(String idTokenString, String role) {
        try {
            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = googleAuthService.verifyToken(idTokenString);
            String email = payload.getEmail();
            
            User existingUser = userRepository.findByEmail(email);
            if (existingUser != null) {
                throw new ResourceConflictException("An account with this email already exists. Please log in instead.");
            }
            
            // Create new user with specified role
            User user = new User();
            user.setEmail(email);
            user.setFirstName((String) payload.get("given_name"));
            user.setLastName((String) payload.get("family_name"));
            user.setRole(User.Role.valueOf(role.toUpperCase()));
            user.setAccountStatus(User.AccountStatus.ACTIVE);
            user.setEmailVerified(true);
            // Random password since they login with Google
            user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            
            userRepository.save(user);
            
            return jwtTokenProvider.generateToken(user);
        } catch (ResourceConflictException e) {
            throw e; // Re-throw ResourceConflictException as-is
        } catch (Exception e) {
            logger.error("Google Sign Up Failed", e);
            throw new UnauthorizedException("Invalid Google Token");
        }
    }

    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setMobileNumber(user.getMobileNumber());
        response.setRole(user.getRole().name());
        response.setAccountStatus(user.getAccountStatus().name());
        return response;
    }
}