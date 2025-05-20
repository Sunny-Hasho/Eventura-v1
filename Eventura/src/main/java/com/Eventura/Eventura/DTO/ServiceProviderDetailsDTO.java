package com.Eventura.Eventura.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceProviderDetailsDTO {
    private Long id;
    private String serviceProviderName;
    private String about;
    private String description;
    private String phone;
    private String email;
    private String address;
    private String accountDetails;
    private String socialMediaLink;
    private String certificates;
    private String experience;
    private Long serviceProviderId;
}
