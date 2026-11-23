package com.tcc.bitebyte.service;

import com.tcc.bitebyte.dto.HistoricoChatDTO;
import com.tcc.bitebyte.entity.HistoricoChat;
import com.tcc.bitebyte.entity.Usuario;
import com.tcc.bitebyte.repository.HistoricoChatRepository;
import com.tcc.bitebyte.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistoricoChatService {

    @Autowired
    private HistoricoChatRepository historicoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;


    // =========================================================
    // SALVAR CONVERSA
    // =========================================================

    public HistoricoChat salvar(HistoricoChatDTO dto) {

        Usuario usuario = usuarioRepository
                .findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuário não encontrado."
                        )
                );

        HistoricoChat historico = new HistoricoChat();

        historico.setUsuario(usuario);
        historico.setMensagem(dto.getMensagem());
        historico.setResposta(dto.getResposta());
        historico.setIntencao(dto.getIntencao());

        return historicoRepository.save(historico);
    }


    // =========================================================
    // BUSCAR HISTÓRICO
    // =========================================================

    public List<HistoricoChat> buscarPorEmail(String email) {

        Usuario usuario = usuarioRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuário não encontrado."
                        )
                );

        return historicoRepository
                .findTop10ByUsuarioOrderByDataHoraDesc(usuario);
    }
}