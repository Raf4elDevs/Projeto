package com.tcc.bitebyte.controller;

import com.tcc.bitebyte.dto.EnsinamentoChefbotDTO;
import com.tcc.bitebyte.entity.EnsinamentoChefbot;
import com.tcc.bitebyte.service.EnsinamentoChefbotService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat/teachings")
@CrossOrigin("*")
public class EnsinamentoChefbotController {

    @Autowired
    private EnsinamentoChefbotService service;

    @PostMapping
    public EnsinamentoChefbot salvar(
            @RequestBody EnsinamentoChefbotDTO dto) {

        return service.salvar(dto);
    }

    @GetMapping
    public List<EnsinamentoChefbot> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/approved")
    public List<EnsinamentoChefbot> listarAprovados() {
        return service.listarAprovados();
    }
}