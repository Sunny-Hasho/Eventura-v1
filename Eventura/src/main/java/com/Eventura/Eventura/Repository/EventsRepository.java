package com.Eventura.Eventura.Repository;

import com.Eventura.Eventura.Model.Events;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventsRepository extends JpaRepository<Events, Long> {

    // ✅ New: fetch all events by service provider ID
    List<Events> findAllByServiceProvider_Id(Long serviceProviderId);
}
