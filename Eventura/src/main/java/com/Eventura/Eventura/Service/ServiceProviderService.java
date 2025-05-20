package com.Eventura.Eventura.Service;


import com.Eventura.Eventura.DTO.ServiceProviderDTO;

import java.util.List;

public interface ServiceProviderService {
    ServiceProviderDTO create(ServiceProviderDTO dto);
    List<ServiceProviderDTO> getAll();
    ServiceProviderDTO getById(Long id);
    ServiceProviderDTO update(Long id, ServiceProviderDTO dto);
    void delete(Long id);
}
