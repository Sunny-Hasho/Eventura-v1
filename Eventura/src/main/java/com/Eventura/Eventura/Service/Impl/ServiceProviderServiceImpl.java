package com.Eventura.Eventura.Service.Impl;


import com.Eventura.Eventura.DTO.ServiceProviderDTO;
import com.Eventura.Eventura.ExceptionHandler.ResourceNotFoundException;
import com.Eventura.Eventura.Mapper.ServiceProviderMapper;
import com.Eventura.Eventura.Model.ServiceProvider;
import com.Eventura.Eventura.Repository.ServiceProviderRepository;
import com.Eventura.Eventura.Service.ServiceProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceProviderServiceImpl implements ServiceProviderService {

    private final ServiceProviderRepository repository;

    @Override
    public ServiceProviderDTO create(ServiceProviderDTO dto) {
        return ServiceProviderMapper.toDTO(repository.save(ServiceProviderMapper.toEntity(dto)));
    }

    @Override
    public List<ServiceProviderDTO> getAll() {
        return repository.findAll().stream()
                .map(ServiceProviderMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceProviderDTO getById(Long id) {
        ServiceProvider entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service provider not found"));
        return ServiceProviderMapper.toDTO(entity);
    }

    @Override
    public ServiceProviderDTO update(Long id, ServiceProviderDTO dto) {
        ServiceProvider existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service provider not found"));

        existing.setName(dto.getName());
        existing.setSlogan(dto.getSlogan());

        if (dto.getPhoto() != null) {
            existing.setPhoto(ServiceProviderMapper.toEntity(dto).getPhoto());
        }

        return ServiceProviderMapper.toDTO(repository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Service provider not found");
        }
        repository.deleteById(id);
    }
}
