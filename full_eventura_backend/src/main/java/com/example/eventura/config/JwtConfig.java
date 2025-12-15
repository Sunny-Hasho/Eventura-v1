package com.example.eventura.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    // Define JWT secret key as a bean
    @Bean
    public SecretKey jwtSecretKey() {
        // Use the configured secret key
        // Ensure the key is long enough (at least 32 bytes for HS256, 64 for HS512)
        // If using HS512, make sure the default key in properties is long enough.
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // Define JWT expiration time as a bean (in milliseconds)
    @Bean
    public Long jwtExpirationMs() {
        return expiration;
    }
}