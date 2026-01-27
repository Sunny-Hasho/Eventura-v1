package com.example.eventura.dto.request;

import lombok.Data;

@Data
public class GoogleSignUpRequest {
    private String token;
    private String role; // "CLIENT" or "PROVIDER"
}
