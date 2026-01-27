package com.example.eventura.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class GoogleAuthService {

    @Value("${google.client.id}")
    private String clientId;

    public GoogleIdToken.Payload verifyToken(String idTokenString) throws GeneralSecurityException, IOException {
        System.out.println("Verifying Google ID Token: " + (idTokenString != null ? idTokenString.substring(0, 10) + "..." : "null"));
        System.out.println("Expected Client ID: " + clientId);

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();

        GoogleIdToken idToken = null;
        try {
            idToken = verifier.verify(idTokenString);
        } catch (Exception e) {
            System.err.println("Token verification failed with exception: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }

        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            System.out.println("Token Verified Successfully. Email: " + payload.getEmail());
            return payload;
        } else {
            System.err.println("Token verification returned null (Invalid ID token)");
            throw new IllegalArgumentException("Invalid ID token.");
        }
    }
}
