package com.Eventura.Eventura.Service.Impl;


import com.Eventura.Eventura.DTO.BookingDTO;
import com.Eventura.Eventura.ExceptionHandler.ResourceNotFoundException;
import com.Eventura.Eventura.Mapper.BookingMapper;
import com.Eventura.Eventura.Model.Booking;
import com.Eventura.Eventura.Model.Events;
import com.Eventura.Eventura.Model.User;
import com.Eventura.Eventura.Repository.BookingRepository;
import com.Eventura.Eventura.Repository.EventsRepository;
import com.Eventura.Eventura.Repository.UserRepository;
import com.Eventura.Eventura.Service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EventsRepository eventsRepository;
    private final UserRepository userRepository;

    @Override
    public BookingDTO create(BookingDTO dto) {
        Events event = eventsRepository.findById(dto.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Booking saved = bookingRepository.save(BookingMapper.toEntity(dto, event, user));
        return BookingMapper.toDTO(saved);
    }

    @Override
    public List<BookingDTO> getAll() {
        return bookingRepository.findAll().stream()
                .map(BookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingDTO getById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return BookingMapper.toDTO(booking);
    }

    @Override
    public BookingDTO update(Long id, BookingDTO dto) {
        Booking existing = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        Events event = eventsRepository.findById(dto.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        existing.setDate(dto.getDate());
        existing.setBooked(dto.getBooked());
        existing.setPaymentRefNumber(dto.getPaymentRefNumber());
        existing.setEvent(event);
        existing.setUser(user);
        existing.setCustomerId(dto.getCustomerId());

        Booking updated = bookingRepository.save(existing);
        return BookingMapper.toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }
}
