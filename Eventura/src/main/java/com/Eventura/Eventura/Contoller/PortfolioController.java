package com.Eventura.Eventura.Contoller;


import com.Eventura.Eventura.DTO.PortfolioDTO;
import com.Eventura.Eventura.Service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @PostMapping
    public ResponseEntity<PortfolioDTO> create(@RequestBody PortfolioDTO dto) {
        return ResponseEntity.ok(portfolioService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<PortfolioDTO>> getAll() {
        return ResponseEntity.ok(portfolioService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(portfolioService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortfolioDTO> update(@PathVariable Long id, @RequestBody PortfolioDTO dto) {
        return ResponseEntity.ok(portfolioService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        portfolioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
