package com.example.user_service.service;

import com.example.user_service.entity.User;

public interface TokenService {
    String generateToken(User account);

    User getAccountByToken(String token);
}

