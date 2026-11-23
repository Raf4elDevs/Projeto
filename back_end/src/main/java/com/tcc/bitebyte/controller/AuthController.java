package com.tcc.bitebyte.controller;

import com.tcc.bitebyte.dto.LoginDTO;
import com.tcc.bitebyte.dto.LoginResponseDTO;
import com.tcc.bitebyte.dto.RegisterDTO;
import com.tcc.bitebyte.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/register")
    public String register(
            @RequestBody RegisterDTO dto
    ) {
        return service.cadastrar(dto);
    }

    @PostMapping("/login")
    public LoginResponseDTO login(
            @RequestBody LoginDTO dto
    ) {
        return service.login(dto);
    }
}