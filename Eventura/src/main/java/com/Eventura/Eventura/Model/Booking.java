package com.Eventura.Eventura.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@Table(name="booking")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date date;

    private String paymentRefNumber;

    private Boolean booked;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Events event;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Long customerId;

    @Column(nullable = false)
    private String status;
}
