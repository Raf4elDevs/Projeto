package com.tcc.bitebyte.service;

import com.tcc.bitebyte.dto.EnsinamentoChefbotDTO;
import com.tcc.bitebyte.entity.EnsinamentoChefbot;
import com.tcc.bitebyte.repository.EnsinamentoChefbotRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnsinamentoChefbotService {

    @Autowired
    private EnsinamentoChefbotRepository repository;

    public EnsinamentoChefbot salvar(EnsinamentoChefbotDTO dto) {

        EnsinamentoChefbot ensinamento = new EnsinamentoChefbot();

        ensinamento.setPergunta(dto.getPergunta());
        ensinamento.setResposta(dto.getResposta());
        ensinamento.setCategoria(dto.getCategoria());

        if (dto.getAprovado() != null) {
            ensinamento.setAprovado(dto.getAprovado());
        }

        return repository.save(ensinamento);
    }

    public List<EnsinamentoChefbot> listarAprovados() {
        return repository.findByAprovadoTrue();
    }

    public List<EnsinamentoChefbot> listarTodos() {
        return repository.findAll();
    }
}