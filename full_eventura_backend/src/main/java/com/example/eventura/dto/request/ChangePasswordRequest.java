package com.example.eventura.dto.request;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String email;
    private String otp;
    private String newPassword;
}
