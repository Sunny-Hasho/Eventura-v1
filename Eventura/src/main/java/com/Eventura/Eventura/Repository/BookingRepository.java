package com.Eventura.Eventura.Repository;

import com.Eventura.Eventura.Model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
