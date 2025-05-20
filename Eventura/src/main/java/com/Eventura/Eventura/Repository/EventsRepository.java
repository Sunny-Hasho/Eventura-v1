package com.Eventura.Eventura.Repository;

import com.Eventura.Eventura.Model.Events;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventsRepository extends JpaRepository<Events, Long> {
}
