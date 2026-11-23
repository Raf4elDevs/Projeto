package com.tcc.bitebyte.controller;

import com.tcc.bitebyte.dto.ReceitaDTO;
import com.tcc.bitebyte.entity.Receita;
import com.tcc.bitebyte.service.ReceitaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recipes")
@CrossOrigin(
        origins = {
                "http://localhost:5500",
                "http://127.0.0.1:5500",
                "http://localhost:5501",
                "http://127.0.0.1:5501"
        },
        allowCredentials = "true"
)
public class ReceitaController {

    @Autowired
    private ReceitaService service;

    // LISTAR TODAS
    @GetMapping
    public List<Receita> listar() {
        return service.listarTodas();
    }

    // BUSCAR POR NOME
    @GetMapping("/search")
    public List<Receita> buscar(@RequestParam String q) {
        return service.buscar(q);
    }

    // BUSCA PARA O CHEFBOT (IA) - ordenada por relevância
    @GetMapping("/chefbot/search")
    public List<Receita> buscarParaChefbot(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false) Integer limite,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String dificuldade,
            @RequestParam(required = false) Integer tempoMaximo
    ) {
        return service.buscarParaChefbot(q, limite, categoria, dificuldade, tempoMaximo);
    }

    // BUSCAR UMA RECEITA
    @GetMapping("/{id}")
    public Receita buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    // CRIAR
    @PostMapping
    public Receita criar(@RequestBody ReceitaDTO dto) {
        return service.criar(dto);
    }

    // EDITAR
    @PutMapping("/{id}")
    public Receita atualizar(
            @PathVariable Long id,
            @RequestBody ReceitaDTO dto
    ) {
        return service.atualizar(id, dto);
    }

    // EXCLUIR
    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}