package com.Eventura.Eventura.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceProviderDTO {
    private Long id;
    private String name;
    private String slogan;
    private String photo;
}
