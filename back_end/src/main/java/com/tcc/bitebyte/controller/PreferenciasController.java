package com.tcc.bitebyte.controller;

import com.tcc.bitebyte.dto.PreferenciasDTO;
import com.tcc.bitebyte.entity.PreferenciasUsuario;
import com.tcc.bitebyte.service.PreferenciasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user/preferences")
@CrossOrigin("*")
public class PreferenciasController {

    @Autowired
    private PreferenciasService service;

    @PostMapping
    public PreferenciasUsuario salvar(
            @RequestBody PreferenciasDTO dto
    ) {
        return service.salvar(dto);
    }

    @GetMapping("/{email}")
    public PreferenciasUsuario buscar(
            @PathVariable String email
    ) {
        return service.buscarPorEmail(email);
    }
}