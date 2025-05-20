package com.Eventura.Eventura.Repository;


import com.Eventura.Eventura.Model.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
}
