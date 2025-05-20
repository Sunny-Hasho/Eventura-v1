package com.Eventura.Eventura.Mapper;


import com.Eventura.Eventura.DTO.ServiceProviderDetailsDTO;
import com.Eventura.Eventura.Model.ServiceProvider;
import com.Eventura.Eventura.Model.ServiceProviderDetails;
import lombok.experimental.UtilityClass;

@UtilityClass
public class ServiceProviderDetailsMapper {

    public ServiceProviderDetailsDTO toDTO(ServiceProviderDetails details) {
        return ServiceProviderDetailsDTO.builder()
                .id(details.getId())
                .serviceProviderName(details.getServiceProviderName())
                .about(details.getAbout())
                .description(details.getDescription())
                .phone(details.getPhone())
                .email(details.getEmail())
                .address(details.getAddress())
                .accountDetails(details.getAccountDetails())
                .socialMediaLink(details.getSocialMediaLink())
                .certificates(details.getCertificates())
                .experience(details.getExperience())
                .serviceProviderId(details.getServiceProvider() != null ? details.getServiceProvider().getId() : null)
                .build();
    }

    public ServiceProviderDetails toEntity(ServiceProviderDetailsDTO dto, ServiceProvider serviceProvider) {
        return ServiceProviderDetails.builder()
                .id(dto.getId())
                .serviceProviderName(dto.getServiceProviderName())
                .about(dto.getAbout())
                .description(dto.getDescription())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .accountDetails(dto.getAccountDetails())
                .socialMediaLink(dto.getSocialMediaLink())
                .certificates(dto.getCertificates())
                .experience(dto.getExperience())
                .serviceProvider(serviceProvider)
                .build();
    }
}
