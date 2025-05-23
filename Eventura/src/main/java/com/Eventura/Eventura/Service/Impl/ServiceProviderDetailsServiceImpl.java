package com.Eventura.Eventura.Service.Impl;

import com.Eventura.Eventura.DTO.ServiceProviderDetailsDTO;
import com.Eventura.Eventura.ExceptionHandler.ResourceNotFoundException;
import com.Eventura.Eventura.Mapper.ServiceProviderDetailsMapper;
import com.Eventura.Eventura.Model.ServiceProvider;
import com.Eventura.Eventura.Model.ServiceProviderDetails;
import com.Eventura.Eventura.Repository.ServiceProviderDetailsRepository;
import com.Eventura.Eventura.Repository.ServiceProviderRepository;
import com.Eventura.Eventura.Service.ServiceProviderDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceProviderDetailsServiceImpl implements ServiceProviderDetailsService {

    private final ServiceProviderDetailsRepository repository;
    private final ServiceProviderRepository serviceProviderRepository;

    @Override
    public ServiceProviderDetailsDTO create(ServiceProviderDetailsDTO dto) {
        ServiceProvider provider = serviceProviderRepository.findById(dto.getServiceProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Service provider not found"));
        return ServiceProviderDetailsMapper.toDTO(repository.save(
                ServiceProviderDetailsMapper.toEntity(dto, provider)));
    }

    @Override
    public List<ServiceProviderDetailsDTO> getAll() {
        return repository.findAll().stream()
                .map(ServiceProviderDetailsMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceProviderDetailsDTO getById(Long id) {
        ServiceProviderDetails details = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Details not found"));
        return ServiceProviderDetailsMapper.toDTO(details);
    }

    @Override
    public ServiceProviderDetailsDTO update(Long id, ServiceProviderDetailsDTO dto) {
        ServiceProviderDetails existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Details not found"));

        ServiceProvider provider = serviceProviderRepository.findById(dto.getServiceProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Service provider not found"));

        existing.setServiceProviderName(dto.getServiceProviderName());
        existing.setAbout(dto.getAbout());
        existing.setDescription(dto.getDescription());
        existing.setPhone(dto.getPhone());
        existing.setEmail(dto.getEmail());
        existing.setAddress(dto.getAddress());
        existing.setAccountDetails(dto.getAccountDetails());
        existing.setSocialMediaLink(dto.getSocialMediaLink());
        existing.setCertificates(dto.getCertificates());
        existing.setExperience(dto.getExperience());
        existing.setServiceProvider(provider);

        return ServiceProviderDetailsMapper.toDTO(repository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Details not found");
        }
        repository.deleteById(id);
    }

    // ✅ New method to get by service provider ID
    @Override
    public ServiceProviderDetailsDTO getByServiceProviderId(Long serviceProviderId) {
        ServiceProviderDetails details = repository.findAll().stream()
                .filter(d -> d.getServiceProvider().getId().equals(serviceProviderId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Details not found for provider ID " + serviceProviderId));
        return ServiceProviderDetailsMapper.toDTO(details);
    }
}
