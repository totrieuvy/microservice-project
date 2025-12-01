package com.example.user_service.dto.response;

import com.example.user_service.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ListAccountResponse {
    private Long id;
    private String name;
    private String email;
    private RoleEnum roleEnum;
    private Boolean isActive;
}
