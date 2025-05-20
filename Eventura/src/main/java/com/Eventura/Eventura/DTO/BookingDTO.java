package com.Eventura.Eventura.DTO;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private Long id;
    private Date date;
    private String paymentRefNumber;
    private Boolean booked;
    private Long eventId;
    private Long userId;
    private Long customerId;
}
