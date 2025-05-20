package com.Eventura.Eventura.Mapper;


import com.Eventura.Eventura.DTO.UserDTO;
import com.Eventura.Eventura.Model.User;
import lombok.experimental.UtilityClass;

@UtilityClass
public class UserMapper {

    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .build();
    }

    public User toEntity(UserDTO dto) {
        return User.builder()
                .id(dto.getId())
                .build();
    }
}
