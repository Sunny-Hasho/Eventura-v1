package com.Eventura.Eventura.Service;

import com.Eventura.Eventura.DTO.BookingDTO;

import java.util.List;

public interface BookingService {
    BookingDTO create(BookingDTO dto);
    List<BookingDTO> getAll();
    BookingDTO getById(Long id);
    BookingDTO update(Long id, BookingDTO dto);
    void delete(Long id);

    // Add these
    BookingDTO updateStatus(Long bookingId, String status);
    List<BookingDTO> getByServiceProviderId(Long providerId);
}
