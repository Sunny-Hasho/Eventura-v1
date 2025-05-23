package com.Eventura.Eventura.Contoller;

import com.Eventura.Eventura.DTO.ServiceProviderDetailsDTO;
import com.Eventura.Eventura.Service.ServiceProviderDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-provider-details")
@RequiredArgsConstructor
public class ServiceProviderDetailsController {

    private final ServiceProviderDetailsService service;

    @PostMapping
    public ResponseEntity<ServiceProviderDetailsDTO> create(@RequestBody ServiceProviderDetailsDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<ServiceProviderDetailsDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceProviderDetailsDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/by-provider/{serviceProviderId}")
    public ResponseEntity<ServiceProviderDetailsDTO> getByServiceProviderId(@PathVariable Long serviceProviderId) {
        return ResponseEntity.ok(service.getByServiceProviderId(serviceProviderId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceProviderDetailsDTO> update(@PathVariable Long id, @RequestBody ServiceProviderDetailsDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
