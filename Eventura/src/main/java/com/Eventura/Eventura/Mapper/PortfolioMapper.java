package com.Eventura.Eventura.Mapper;


import com.Eventura.Eventura.DTO.PortfolioDTO;
import com.Eventura.Eventura.Model.Portfolio;
import com.Eventura.Eventura.Model.ServiceProvider;
import lombok.experimental.UtilityClass;

@UtilityClass
public class PortfolioMapper {

    public PortfolioDTO toDTO(Portfolio portfolio) {
        return PortfolioDTO.builder()
                .id(portfolio.getId())
                .title(portfolio.getTitle())
                .description(portfolio.getDescription())
                .category(portfolio.getCategory())
                .clientDetails(portfolio.getClientDetails())
                .serviceProviderId(portfolio.getServiceProvider() != null ? portfolio.getServiceProvider().getId() : null)
                .build();
    }

    public Portfolio toEntity(PortfolioDTO dto, ServiceProvider serviceProvider) {
        return Portfolio.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .clientDetails(dto.getClientDetails())
                .serviceProvider(serviceProvider)
                .build();
    }
}
