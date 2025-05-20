package com.Eventura.Eventura.Service.Impl;


import com.Eventura.Eventura.DTO.EventProfessionalDTO;
import com.Eventura.Eventura.ExceptionHandler.ResourceNotFoundException;
import com.Eventura.Eventura.Mapper.EventProfessionalMapper;
import com.Eventura.Eventura.Model.EventProfessional;
import com.Eventura.Eventura.Repository.EventProfessionalRepository;
import com.Eventura.Eventura.Service.EventProfessionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventProfessionalServiceImpl implements EventProfessionalService {

    private final EventProfessionalRepository repository;

    @Override
    public EventProfessionalDTO create(EventProfessionalDTO dto) {
        EventProfessional saved = repository.save(EventProfessionalMapper.toEntity(dto));
        return EventProfessionalMapper.toDTO(saved);
    }

    @Override
    public List<EventProfessionalDTO> getAll() {
        return repository.findAll().stream()
                .map(EventProfessionalMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EventProfessionalDTO getById(Long id) {
        EventProfessional entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professional not found with id: " + id));
        return EventProfessionalMapper.toDTO(entity);
    }

    @Override
    public EventProfessionalDTO update(Long id, EventProfessionalDTO dto) {
        EventProfessional existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professional not found with id: " + id));

        existing.setName(dto.getName());
        existing.setProfession(dto.getProfession());
        existing.setEmail(dto.getEmail());
        existing.setContact(dto.getContact());
        existing.setLocation(dto.getLocation());
        existing.setAbout(dto.getAbout());

        EventProfessional updated = repository.save(existing);
        return EventProfessionalMapper.toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Professional not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
