package com.Eventura.Eventura.Mapper;

import com.Eventura.Eventura.DTO.BookingDTO;
import com.Eventura.Eventura.Model.Booking;
import com.Eventura.Eventura.Model.Events;
import com.Eventura.Eventura.Model.User;
import lombok.experimental.UtilityClass;

@UtilityClass
public class BookingMapper {

    public BookingDTO toDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .date(booking.getDate())
                .paymentRefNumber(booking.getPaymentRefNumber())
                .booked(booking.getBooked())
                .eventId(booking.getEvent() != null ? booking.getEvent().getId() : null)
                .eventName(booking.getEvent() != null ? booking.getEvent().getName() : null)
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userEmail(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .customerId(booking.getCustomerId())
                .status(booking.getStatus())
                .build();
    }

    public Booking toEntity(BookingDTO dto, Events event, User user) {
        return Booking.builder()
                .id(dto.getId())
                .date(dto.getDate())
                .paymentRefNumber(dto.getPaymentRefNumber())
                .booked(dto.getBooked())
                .event(event)
                .user(user)
                .customerId(dto.getCustomerId())
                .status(dto.getStatus() != null ? dto.getStatus() : "PENDING")
                .build();
    }
}
