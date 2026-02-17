package com.example.eventura.repository;

import com.example.eventura.entity.Report;
import com.example.eventura.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findByReportedUser(User reportedUser, Pageable pageable);
    Page<Report> findByReportedBy(User reportedBy, Pageable pageable);
    Page<Report> findByStatus(Report.Status status, Pageable pageable);
}
