package com.Eventura.Eventura.Contoller;


import com.Eventura.Eventura.DTO.EventsDTO;
import com.Eventura.Eventura.Service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventsController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventsDTO> create(@RequestBody EventsDTO dto) {
        return ResponseEntity.ok(eventService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<EventsDTO>> getAll() {
        return ResponseEntity.ok(eventService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventsDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventsDTO> update(@PathVariable Long id, @RequestBody EventsDTO dto) {
        return ResponseEntity.ok(eventService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
