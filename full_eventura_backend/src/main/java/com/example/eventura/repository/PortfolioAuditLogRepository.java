package com.example.eventura.repository;

import com.example.eventura.entity.PortfolioAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioAuditLogRepository extends JpaRepository<PortfolioAuditLog, Long> {
    List<PortfolioAuditLog> findByPortfolioIdOrderByChangedAtDesc(Long portfolioId);
}
