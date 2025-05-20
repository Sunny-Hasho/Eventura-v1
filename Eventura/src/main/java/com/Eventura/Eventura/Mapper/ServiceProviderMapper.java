package com.Eventura.Eventura.Mapper;


import com.Eventura.Eventura.DTO.ServiceProviderDTO;
import com.Eventura.Eventura.Model.ServiceProvider;
import lombok.experimental.UtilityClass;

import java.util.Arrays;
import java.util.Base64;

@UtilityClass
public class ServiceProviderMapper {

    public ServiceProviderDTO toDTO(ServiceProvider provider) {
        return ServiceProviderDTO.builder()
                .id(provider.getId())
                .name(provider.getName())
                .slogan(provider.getSlogan())
                .photo(provider.getPhoto() != null ? Base64.getEncoder().encodeToString(toPrimitive(provider.getPhoto())) : null)
                .build();
    }

    public ServiceProvider toEntity(ServiceProviderDTO dto) {
        return ServiceProvider.builder()
                .id(dto.getId())
                .name(dto.getName())
                .slogan(dto.getSlogan())
                .photo(dto.getPhoto() != null ? toObject(Base64.getDecoder().decode(dto.getPhoto())) : null)
                .build();
    }

    // Convert Byte[] to byte[]
    private byte[] toPrimitive(Byte[] bytes) {
        byte[] result = new byte[bytes.length];
        for (int i = 0; i < bytes.length; i++) {
            result[i] = bytes[i];
        }
        return result;
    }

    // Convert byte[] to Byte[]
    private Byte[] toObject(byte[] bytes) {
        Byte[] result = new Byte[bytes.length];
        for (int i = 0; i < bytes.length; i++) {
            result[i] = bytes[i];
        }
        return result;
    }
}

