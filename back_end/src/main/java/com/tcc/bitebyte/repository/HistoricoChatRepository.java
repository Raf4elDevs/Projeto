package com.tcc.bitebyte.repository;

import com.tcc.bitebyte.entity.HistoricoChat;
import com.tcc.bitebyte.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricoChatRepository
        extends JpaRepository<HistoricoChat, Long> {

    List<HistoricoChat> findTop10ByUsuarioOrderByDataHoraDesc(
            Usuario usuario
    );
}