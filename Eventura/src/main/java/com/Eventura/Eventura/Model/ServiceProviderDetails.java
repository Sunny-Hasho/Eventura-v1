package com.Eventura.Eventura.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceProviderDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @OneToOne
    @JoinColumn(name = "service_provider_id")
    private ServiceProvider serviceProvider;
}
