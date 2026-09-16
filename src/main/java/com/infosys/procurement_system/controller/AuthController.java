package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.AuthResponseDTO;
import com.infosys.procurement_system.dto.LoginRequestDTO;
import com.infosys.procurement_system.dto.RegisterRequestDto;
import com.infosys.procurement_system.dto.SupplierRegisterRequestDto;
import com.infosys.procurement_system.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterRequestDto requestDto) {
        AuthResponseDTO responseDto = authService.register(requestDto);
        return ResponseEntity.ok(ApiResponse.success("Successfully registered", responseDto));
    }

    @PostMapping("/register-supplier")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> registerSupplier(@Valid @RequestBody SupplierRegisterRequestDto requestDto) {
        AuthResponseDTO responseDto = authService.registerSupplier(requestDto);
        return ResponseEntity.ok(ApiResponse.success("Successfully registered as supplier", responseDto));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO requestDto,
            HttpServletRequest request,
            HttpServletResponse response) {
        AuthResponseDTO responseDto = authService.login(requestDto, request, response);
        return ResponseEntity.ok(ApiResponse.success("Logged in successfully", responseDto));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> logout(HttpServletRequest request,
            HttpServletResponse response) {
        AuthResponseDTO responseDto = authService.logout(request, response);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", responseDto));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> me() {
        AuthResponseDTO responseDto = authService.me();
        return ResponseEntity.ok(ApiResponse.success("Data is ready", responseDto));
    }
}
