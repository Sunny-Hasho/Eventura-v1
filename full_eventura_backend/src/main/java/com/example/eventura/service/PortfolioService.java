package com.example.eventura.service;

import com.example.eventura.dto.request.PortfolioRequest;
import com.example.eventura.dto.response.PortfolioResponse;
import com.example.eventura.entity.Portfolio;
import com.example.eventura.entity.PortfolioAuditLog;
import com.example.eventura.entity.ServiceProvider;
import com.example.eventura.exception.ResourceNotFoundException;
import com.example.eventura.repository.PortfolioAuditLogRepository;
import com.example.eventura.repository.PortfolioRepository;
import com.example.eventura.repository.ServiceProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final PortfolioAuditLogRepository portfolioAuditLogRepository;
    private final NotificationService notificationService;

    public PortfolioResponse createPortfolio(Long providerId, PortfolioRequest request) {
        ServiceProvider provider = serviceProviderRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        Portfolio portfolio = new Portfolio();
        portfolio.setProvider(provider);
        portfolio.setTitle(request.getTitle());
        portfolio.setDescription(request.getDescription());
        portfolio.setImageUrl(request.getImageUrl());
        portfolio.setProjectDate(request.getProjectDate());
        portfolio.setEventType(request.getEventType());
        portfolio.setStatus(Portfolio.Status.ACTIVE);

        Portfolio savedPortfolio = portfolioRepository.save(portfolio);
        return convertToResponse(savedPortfolio);
    }

    public Page<PortfolioResponse> getPortfolios(Long providerId, Pageable pageable) {
        ServiceProvider provider = serviceProviderRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        return portfolioRepository.findByProvider(provider, pageable)
                .map(this::convertToResponse);
    }

    public Page<PortfolioResponse> getAllPortfolios(String status, Pageable pageable) {
        Page<Portfolio> portfolios;

        if (status != null && !status.isEmpty()) {
            try {
                Portfolio.Status portfolioStatus = Portfolio.Status.valueOf(status.toUpperCase());

                // Create specification for status filtering
                Specification<Portfolio> spec = (root, query, cb) ->
                        cb.equal(root.get("status"), portfolioStatus);

                portfolios = portfolioRepository.findAll(spec, pageable);
            } catch (IllegalArgumentException e) {
                throw new ResourceNotFoundException("Invalid status: " + status);
            }
        } else {
            portfolios = portfolioRepository.findAll(pageable);
        }

        return portfolios.map(this::convertToResponse);
    }

    public PortfolioResponse updatePortfolioStatus(Long portfolioId, String status) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        try {
            portfolio.setStatus(Portfolio.Status.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid status: " + status);
        }

        Portfolio updatedPortfolio = portfolioRepository.save(portfolio);
        return convertToResponse(updatedPortfolio);
    }

    @Transactional
    public PortfolioResponse updatePortfolio(Long providerId, Long portfolioId, PortfolioRequest request) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        if (!portfolio.getProvider().getId().equals(providerId)) {
            throw new RuntimeException("Unauthorized: Provider does not own this portfolio item");
        }

        // Check and log changes
        compareAndLog(portfolio, "title", portfolio.getTitle(), request.getTitle());
        compareAndLog(portfolio, "description", portfolio.getDescription(), request.getDescription());
        compareAndLog(portfolio, "imageUrl", portfolio.getImageUrl(), request.getImageUrl());
        compareAndLog(portfolio, "projectDate", portfolio.getProjectDate(), request.getProjectDate());
        compareAndLog(portfolio, "eventType", portfolio.getEventType(), request.getEventType());

        // Update fields
        portfolio.setTitle(request.getTitle());
        portfolio.setDescription(request.getDescription());
        portfolio.setImageUrl(request.getImageUrl());
        portfolio.setProjectDate(request.getProjectDate());
        portfolio.setEventType(request.getEventType());
        // Do not auto-change status to PENDING_REVIEW yet unless requirement clarifies. Keeping ACTIVE for now.

        Portfolio updatedPortfolio = portfolioRepository.save(portfolio);
        return convertToResponse(updatedPortfolio);
    }

    private void compareAndLog(Portfolio portfolio, String fieldName, Object oldValue, Object newValue) {
        String oldStr = oldValue == null ? "" : oldValue.toString();
        String newStr = newValue == null ? "" : newValue.toString();

        if (!Objects.equals(oldStr, newStr)) {
            PortfolioAuditLog log = new PortfolioAuditLog();
            log.setPortfolio(portfolio);
            log.setProvider(portfolio.getProvider());
            log.setFieldName(fieldName);
            log.setOldValue(oldStr);
            log.setNewValue(newStr);
            log.setChangedAt(LocalDateTime.now());
            portfolioAuditLogRepository.save(log);
        }
    }

    public List<PortfolioAuditLog> getPortfolioHistory(Long portfolioId) {
        return portfolioAuditLogRepository.findByPortfolioIdOrderByChangedAtDesc(portfolioId);
    }

    @Transactional
    public void deletePortfolioByAdmin(Long portfolioId, String reason) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        
        // Notify provider
        String message = String.format("Your portfolio item '%s' was deleted by an administrator. Reason: %s", 
                portfolio.getTitle(), reason);
        notificationService.createNotification(portfolio.getProvider().getUser(), message);
        
        portfolioRepository.delete(portfolio);
    }

    private PortfolioResponse convertToResponse(Portfolio portfolio) {
        PortfolioResponse response = new PortfolioResponse();
        response.setId(portfolio.getId());
        response.setProviderId(portfolio.getProvider().getId());
        response.setTitle(portfolio.getTitle());
        response.setDescription(portfolio.getDescription());
        response.setImageUrl(portfolio.getImageUrl());
        response.setProjectDate(portfolio.getProjectDate());
        response.setEventType(portfolio.getEventType());
        response.setStatus(portfolio.getStatus().name());
        response.setCreatedAt(portfolio.getCreatedAt());
        return response;
    }
}
