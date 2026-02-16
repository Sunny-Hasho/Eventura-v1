package com.example.eventura.service;

import com.example.eventura.entity.Report;
import com.example.eventura.entity.ServiceRequest;
import com.example.eventura.entity.User;
import com.example.eventura.exception.ResourceNotFoundException;
import com.example.eventura.repository.ReportRepository;
import com.example.eventura.repository.ServiceRequestRepository;
import com.example.eventura.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ServiceRequestRepository serviceRequestRepository;

    public Report createReport(Long reportedById, Long reportedUserId, Long requestId, String reason) {
        User reportedBy = userRepository.findById(reportedById)
                .orElseThrow(() -> new ResourceNotFoundException("Reporting user not found"));

        User reportedUser = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Reported user not found"));

        Report report = new Report();
        report.setReportedBy(reportedBy);
        report.setReportedUser(reportedUser);
        report.setReason(reason);

        if (requestId != null) {
            ServiceRequest request = serviceRequestRepository.findById(requestId)
                    .orElse(null);
            report.setRequest(request);
        }

        Report savedReport = reportRepository.save(report);

        // Notify Admin (Generic notification mechanism, ideally to all admins)
        // For now, we just log or could notify specific admin if we had their ID
        
        return savedReport;
    }

    public Page<Report> getAllReports(Report.Status status, Pageable pageable) {
        if (status != null) {
            return reportRepository.findByStatus(status, pageable);
        }
        return reportRepository.findAll(pageable);
    }

    public Report getReport(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
    }

    public Report updateReportStatus(Long reportId, Report.Status status) {
        Report report = getReport(reportId);
        report.setStatus(status);
        return reportRepository.save(report);
    }
}
