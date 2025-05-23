package com.Eventura.Eventura.Repository;

import com.Eventura.Eventura.Model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findAllByEvent_ServiceProvider_Id(Long serviceProviderId);

}
