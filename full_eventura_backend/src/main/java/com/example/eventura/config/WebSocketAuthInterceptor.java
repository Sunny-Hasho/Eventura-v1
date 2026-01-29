package com.example.eventura.config;

import com.example.eventura.security.CustomUserDetailsService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final CustomUserDetailsService userDetailsService;

    public WebSocketAuthInterceptor(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Get token from Authorization header
            List<String> authHeader = accessor.getNativeHeader("Authorization");
            
            if (authHeader != null && !authHeader.isEmpty()) {
                String authToken = authHeader.get(0);
                
                if (authToken != null && authToken.startsWith("Bearer ")) {
                    String token = authToken.substring(7);
                    
                    try {
                        Claims claims = Jwts.parserBuilder()
                                .setSigningKey(jwtSecret.getBytes())
                                .build()
                                .parseClaimsJws(token)
                                .getBody();

                        String email = claims.getSubject();
                        
                        if (email != null) {
                            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                            UsernamePasswordAuthenticationToken auth = 
                                new UsernamePasswordAuthenticationToken(
                                    userDetails, 
                                    null, 
                                    userDetails.getAuthorities()
                                );
                            accessor.setUser(auth);
                        }
                    } catch (Exception e) {
                        // Invalid token - connection will be rejected
                        throw new IllegalArgumentException("Invalid JWT token");
                    }
                }
            }
        }

        return message;
    }
}
