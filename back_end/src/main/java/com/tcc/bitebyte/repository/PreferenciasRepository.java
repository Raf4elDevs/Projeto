package com.tcc.bitebyte.repository;

import com.tcc.bitebyte.entity.PreferenciasUsuario;
import com.tcc.bitebyte.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PreferenciasRepository
        extends JpaRepository<PreferenciasUsuario, Long> {

    Optional<PreferenciasUsuario> findByUsuario(Usuario usuario);
}