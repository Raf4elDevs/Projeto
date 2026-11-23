package com.tcc.bitebyte.repository;

import com.tcc.bitebyte.entity.Receita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReceitaRepository extends JpaRepository<Receita, Long> {

    List<Receita> findByTituloContainingIgnoreCase(String titulo);

    List<Receita> findByCategoriaContainingIgnoreCase(String categoria);
}