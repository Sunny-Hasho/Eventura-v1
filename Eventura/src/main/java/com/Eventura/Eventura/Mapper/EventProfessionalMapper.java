package com.Eventura.Eventura.Mapper;

import com.Eventura.Eventura.DTO.EventProfessionalDTO;
import com.Eventura.Eventura.Model.EventProfessional;

public class EventProfessionalMapper {

    public static EventProfessionalDTO toDTO(EventProfessional entity) {
        return EventProfessionalDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .profession(entity.getProfession())
                .email(entity.getEmail())
                .contact(entity.getContact())
                .location(entity.getLocation())
                .about(entity.getAbout())
                .build();
    }

    public static EventProfessional toEntity(EventProfessionalDTO dto) {
        return EventProfessional.builder()
                .id(dto.getId())
                .name(dto.getName())
                .profession(dto.getProfession())
                .email(dto.getEmail())
                .contact(dto.getContact())
                .location(dto.getLocation())
                .about(dto.getAbout())
                .build();
    }
}
