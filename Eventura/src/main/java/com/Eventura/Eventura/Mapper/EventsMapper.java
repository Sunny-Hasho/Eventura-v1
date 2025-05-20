package com.Eventura.Eventura.Mapper;


import com.Eventura.Eventura.DTO.EventsDTO;
import com.Eventura.Eventura.Model.Events;
import com.Eventura.Eventura.Model.ServiceProvider;
import lombok.experimental.UtilityClass;

@UtilityClass
public class EventsMapper {

    public EventsDTO toDTO(Events events) {
        return EventsDTO.builder()
                .id(events.getId())
                .name(events.getName())
                .description(events.getDescription())
                .eventType(events.getEventType())
                .price(events.getPrice())
                .serviceProviderId(events.getServiceProvider() != null ? events.getServiceProvider().getId() : null)
                .build();
    }

    public Events toEntity(EventsDTO dto, ServiceProvider serviceProvider) {
        return Events.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .eventType(dto.getEventType())
                .price(dto.getPrice())
                .serviceProvider(serviceProvider)
                .build();
    }
}
