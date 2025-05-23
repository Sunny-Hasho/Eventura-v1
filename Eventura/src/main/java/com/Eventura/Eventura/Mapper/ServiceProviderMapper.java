package com.Eventura.Eventura.Mapper;

import com.Eventura.Eventura.DTO.ServiceProviderDTO;
import com.Eventura.Eventura.Model.ServiceProvider;
import lombok.experimental.UtilityClass;

@UtilityClass
public class ServiceProviderMapper {

    public ServiceProviderDTO toDTO(ServiceProvider provider) {
        return ServiceProviderDTO.builder()
                .id(provider.getId())
                .name(provider.getName())
                .slogan(provider.getSlogan())
                .photo(provider.getPhoto()) // ✅ directly use string
                .build();
    }

    public ServiceProvider toEntity(ServiceProviderDTO dto) {
        return ServiceProvider.builder()
                .id(dto.getId())
                .name(dto.getName())
                .slogan(dto.getSlogan())
                .photo(dto.getPhoto()) // ✅ store base64 as-is
                .build();
    }
}
