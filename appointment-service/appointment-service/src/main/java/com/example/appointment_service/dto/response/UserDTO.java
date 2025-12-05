package com.example.appointment_service.dto.response;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String password;
    private Boolean isActive;
    private String role;
}
