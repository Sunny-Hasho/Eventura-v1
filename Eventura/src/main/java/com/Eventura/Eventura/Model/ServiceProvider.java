package com.Eventura.Eventura.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.lang.reflect.Type;
import java.sql.Blob;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String slogan;

    @Lob
    @Column(name = "photo", columnDefinition = "LONGBLOB") // Optional: specify SQL column type
    private Byte[] photo;
}
