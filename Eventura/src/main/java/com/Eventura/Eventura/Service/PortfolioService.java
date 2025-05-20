package com.Eventura.Eventura.Service;


import com.Eventura.Eventura.DTO.PortfolioDTO;

import java.util.List;

public interface PortfolioService {
    PortfolioDTO create(PortfolioDTO dto);
    List<PortfolioDTO> getAll();
    PortfolioDTO getById(Long id);
    PortfolioDTO update(Long id, PortfolioDTO dto);
    void delete(Long id);
}
