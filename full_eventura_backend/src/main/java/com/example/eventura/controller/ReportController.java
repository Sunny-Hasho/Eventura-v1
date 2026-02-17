package com.example.eventura.controller;

import com.example.eventura.entity.Report;
import com.example.eventura.security.JwtTokenProvider;
import com.example.eventura.service.ReportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'PROVIDER')")
    public ResponseEntity<Report> createReport(
            @RequestBody CreateReportRequest request,
            @RequestHeader("Authorization") String authHeader) {
        Long reportedById = getUserIdFromToken(authHeader);
        return new ResponseEntity<>(reportService.createReport(
                reportedById,
                request.getReportedUserId(),
                request.getRequestId(),
                request.getReason()
        ), HttpStatus.CREATED);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Report>> getAllReports(
            @RequestParam(required = false) Report.Status status,
            Pageable pageable) {
        return ResponseEntity.ok(reportService.getAllReports(status, pageable));
    }

    @PutMapping("/admin/{reportId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Report> updateReportStatus(
            @PathVariable Long reportId,
            @RequestBody Report.Status status) {
        return ResponseEntity.ok(reportService.updateReportStatus(reportId, status));
    }

    private Long getUserIdFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtTokenProvider.getUserIdFromJWT(token);
    }

    @Data
    public static class CreateReportRequest {
        private Long reportedUserId;
        private Long requestId;
        private String reason;
    }
}
