package com.Eventura.Eventura.Service.Impl;


import com.Eventura.Eventura.DTO.PortfolioDTO;
import com.Eventura.Eventura.ExceptionHandler.ResourceNotFoundException;
import com.Eventura.Eventura.Mapper.PortfolioMapper;
import com.Eventura.Eventura.Model.Portfolio;
import com.Eventura.Eventura.Model.ServiceProvider;
import com.Eventura.Eventura.Repository.PortfolioRepository;
import com.Eventura.Eventura.Repository.ServiceProviderRepository;
import com.Eventura.Eventura.Service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepository repository;
    private final ServiceProviderRepository serviceProviderRepository;

    @Override
    public PortfolioDTO create(PortfolioDTO dto) {
        ServiceProvider provider = serviceProviderRepository.findById(dto.getServiceProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Service provider not found"));
        return PortfolioMapper.toDTO(repository.save(PortfolioMapper.toEntity(dto, provider)));
    }

    @Override
    public List<PortfolioDTO> getAll() {
        return repository.findAll().stream()
                .map(PortfolioMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PortfolioDTO getById(Long id) {
        Portfolio portfolio = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        return PortfolioMapper.toDTO(portfolio);
    }

    @Override
    public PortfolioDTO update(Long id, PortfolioDTO dto) {
        Portfolio existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        ServiceProvider provider = serviceProviderRepository.findById(dto.getServiceProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Service provider not found"));

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setCategory(dto.getCategory());
        existing.setClientDetails(dto.getClientDetails());
        existing.setServiceProvider(provider);

        return PortfolioMapper.toDTO(repository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Portfolio not found");
        }
        repository.deleteById(id);
    }
}
