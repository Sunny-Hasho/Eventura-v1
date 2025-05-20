package com.Eventura.Eventura.Service;


import com.Eventura.Eventura.DTO.ServiceProviderDetailsDTO;

import java.util.List;

public interface ServiceProviderDetailsService {
    ServiceProviderDetailsDTO create(ServiceProviderDetailsDTO dto);
    List<ServiceProviderDetailsDTO> getAll();
    ServiceProviderDetailsDTO getById(Long id);
    ServiceProviderDetailsDTO update(Long id, ServiceProviderDetailsDTO dto);
    void delete(Long id);
}
