package com.banking.service;

import com.banking.dto.AuthResponse;
import com.banking.dto.LoginRequest;
import com.banking.dto.RegisterRequest;

public interface AuthService {
    String register(RegisterRequest registerRequest);

    AuthResponse login(LoginRequest loginRequest);
}
