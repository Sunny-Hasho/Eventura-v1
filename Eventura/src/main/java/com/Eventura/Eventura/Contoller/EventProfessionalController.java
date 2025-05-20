package com.Eventura.Eventura.Contoller;


import com.Eventura.Eventura.DTO.EventProfessionalDTO;
import com.Eventura.Eventura.Service.EventProfessionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professionals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // optional: adjust per frontend origin
public class EventProfessionalController {

    private final EventProfessionalService service;

    @PostMapping
    public ResponseEntity<EventProfessionalDTO> create(@RequestBody EventProfessionalDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<EventProfessionalDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventProfessionalDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventProfessionalDTO> update(@PathVariable Long id, @RequestBody EventProfessionalDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
