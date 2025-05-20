package com.Eventura.Eventura.Contoller;


import com.Eventura.Eventura.DTO.ServiceProviderDTO;
import com.Eventura.Eventura.Service.ServiceProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-providers")
@RequiredArgsConstructor
public class ServiceProviderController {

    private final ServiceProviderService service;

    @PostMapping
    public ResponseEntity<ServiceProviderDTO> create(@RequestBody ServiceProviderDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<ServiceProviderDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceProviderDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceProviderDTO> update(@PathVariable Long id, @RequestBody ServiceProviderDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
