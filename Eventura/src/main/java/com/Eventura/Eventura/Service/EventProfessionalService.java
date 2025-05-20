package com.Eventura.Eventura.Service;


import com.Eventura.Eventura.DTO.EventProfessionalDTO;

import java.util.List;

public interface EventProfessionalService {
    EventProfessionalDTO create(EventProfessionalDTO dto);
    List<EventProfessionalDTO> getAll();
    EventProfessionalDTO getById(Long id);
    EventProfessionalDTO update(Long id, EventProfessionalDTO dto);
    void delete(Long id);
}
