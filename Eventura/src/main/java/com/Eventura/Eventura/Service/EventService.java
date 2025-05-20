package com.Eventura.Eventura.Service;


import com.Eventura.Eventura.DTO.EventsDTO;

import java.util.List;

public interface EventService {
    EventsDTO create(EventsDTO dto);
    List<EventsDTO> getAll();
    EventsDTO getById(Long id);
    EventsDTO update(Long id, EventsDTO dto);
    void delete(Long id);
}
