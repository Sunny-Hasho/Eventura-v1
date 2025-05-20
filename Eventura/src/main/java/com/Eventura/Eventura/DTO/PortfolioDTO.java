package com.Eventura.Eventura.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String clientDetails;
    private Long serviceProviderId;
}
