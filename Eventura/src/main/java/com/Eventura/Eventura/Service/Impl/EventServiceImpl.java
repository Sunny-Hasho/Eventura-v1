package com.Eventura.Eventura.Service.Impl;


import com.Eventura.Eventura.DTO.EventsDTO;
import com.Eventura.Eventura.ExceptionHandler.ResourceNotFoundException;
import com.Eventura.Eventura.Mapper.EventsMapper;
import com.Eventura.Eventura.Model.Events;
import com.Eventura.Eventura.Model.ServiceProvider;
import com.Eventura.Eventura.Repository.EventsRepository;
import com.Eventura.Eventura.Repository.ServiceProviderRepository;
import com.Eventura.Eventura.Service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventsRepository eventsRepository;
    private final ServiceProviderRepository serviceProviderRepository;

    @Override
    public EventsDTO create(EventsDTO dto) {
        ServiceProvider provider = serviceProviderRepository.findById(dto.getServiceProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Service provider not found"));
        Events event = EventsMapper.toEntity(dto, provider);
        return EventsMapper.toDTO(eventsRepository.save(event));
    }

    @Override
    public List<EventsDTO> getAll() {
        return eventsRepository.findAll().stream()
                .map(EventsMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EventsDTO getById(Long id) {
        Events event = eventsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return EventsMapper.toDTO(event);
    }

    @Override
    public EventsDTO update(Long id, EventsDTO dto) {
        Events existing = eventsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        ServiceProvider provider = serviceProviderRepository.findById(dto.getServiceProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Service provider not found"));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setEventType(dto.getEventType());
        existing.setPrice(dto.getPrice());
        existing.setServiceProvider(provider);

        return EventsMapper.toDTO(eventsRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        if (!eventsRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found");
        }
        eventsRepository.deleteById(id);
    }
}
