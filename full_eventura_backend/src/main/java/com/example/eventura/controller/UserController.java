package com.example.eventura.controller;

import com.example.eventura.dto.request.LoginRequest;
import com.example.eventura.dto.request.RegisterRequest;
import com.example.eventura.dto.request.UpdateUserRequest;
import com.example.eventura.dto.response.UserResponse;
import com.example.eventura.security.JwtTokenProvider;
import com.example.eventura.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    //User Register
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        return new ResponseEntity<>(userService.register(request), HttpStatus.CREATED);
    }

    //User Login (Initiate)
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.initiateLogin(request));
    }

    // Google Login (existing users only)
    @PostMapping("/google/login")
    public ResponseEntity<String> googleLogin(@RequestBody java.util.Map<String, String> payload) {
        String token = payload.get("token");
        return ResponseEntity.ok(userService.processGoogleLogin(token));
    }

    // Google Sign Up (new users with role)
    @PostMapping("/google/signup")
    public ResponseEntity<String> googleSignUp(@RequestBody com.example.eventura.dto.request.GoogleSignUpRequest request) {
        return ResponseEntity.ok(userService.processGoogleSignUp(request.getToken(), request.getRole()));
    }

    //Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody com.example.eventura.dto.request.VerifyOtpRequest request) {
        return ResponseEntity.ok(userService.verifyOtp(request));
    }

    //Forgot Password
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody com.example.eventura.dto.request.ForgotPasswordRequest request) {
        return ResponseEntity.ok(userService.forgotPassword(request.getEmail()));
    }

    //Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody com.example.eventura.dto.request.ResetPasswordRequest request) {
        return ResponseEntity.ok(userService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword()));
    }

    // Authenticated Change Password Flow
    @PostMapping("/change-password/initiate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> initiateChangePassword(@RequestBody com.example.eventura.dto.request.ForgotPasswordRequest request) {
        // Re-using ForgotPasswordRequest as it just needs email
        return ResponseEntity.ok(userService.initiateChangePassword(request.getEmail()));
    }

    @PostMapping("/change-password/confirm")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> confirmChangePassword(@RequestBody com.example.eventura.dto.request.ChangePasswordRequest request) {
        return ResponseEntity.ok(userService.changePassword(request.getEmail(), request.getOtp(), request.getNewPassword()));
    }

    //Set Status
    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateAccountStatus(@PathVariable Long userId, @RequestBody String status) {
        return ResponseEntity.ok(userService.updateAccountStatus(userId, status));
    }

    // set Account Status to Delete
    @DeleteMapping("/me")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROVIDER')")
    public ResponseEntity<Void> deleteOwnAccount(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        userService.deleteOwnAccount(userId);
        return ResponseEntity.noContent().build();
    }

    //Update User Profile
    @PutMapping("/me")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROVIDER')")
    public ResponseEntity<UserResponse> updateUser(@RequestBody UpdateUserRequest request,
                                                   @RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    //Get Own User Profile
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(userService.getUserById(userId, userId));
    }

    //Get User By ID
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId,
                                                    @RequestHeader("Authorization") String authHeader) {
        Long requestingUserId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(userService.getUserById(userId, requestingUserId));
    }
    private Long getUserIdFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtTokenProvider.getUserIdFromJWT(token);
    }
}