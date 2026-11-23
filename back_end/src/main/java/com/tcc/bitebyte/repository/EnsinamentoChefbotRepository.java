package com.tcc.bitebyte.repository;

import com.tcc.bitebyte.entity.EnsinamentoChefbot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnsinamentoChefbotRepository
        extends JpaRepository<EnsinamentoChefbot, Long> {

    List<EnsinamentoChefbot> findByAprovadoTrue();
}