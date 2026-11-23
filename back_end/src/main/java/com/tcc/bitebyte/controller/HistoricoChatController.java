package com.tcc.bitebyte.controller;

import com.tcc.bitebyte.dto.HistoricoChatDTO;
import com.tcc.bitebyte.entity.HistoricoChat;
import com.tcc.bitebyte.service.HistoricoChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat/history")
@CrossOrigin("*")
public class HistoricoChatController {

    @Autowired
    private HistoricoChatService service;


    // =========================================================
    // SALVAR
    // =========================================================

    @PostMapping
    public HistoricoChat salvar(
            @RequestBody HistoricoChatDTO dto
    ) {

        return service.salvar(dto);
    }


    // =========================================================
    // BUSCAR
    // =========================================================

    @GetMapping("/{email}")
    public List<HistoricoChat> buscar(
            @PathVariable String email
    ) {

        return service.buscarPorEmail(email);
    }
}