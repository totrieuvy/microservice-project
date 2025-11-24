package com.example.user_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required!!!")
    @Size(min = 2, max = 20, message = "Name must be between 2 and 20 characters")
    private String name;

    @NotBlank(message = "Email is required!!!")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required!!!")
    @Size(min = 5, message = "Password must be at least 5 characters long")
    private String password;
}
