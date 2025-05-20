package com.Eventura.Eventura.DTO;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventProfessionalDTO {
    private Long id;
    private String name;
    private String profession;
    private String email;
    private String contact;
    private String location;
    private String about;
}
