package com.tcc.bitebyte.service;

import com.tcc.bitebyte.dto.PreferenciasDTO;
import com.tcc.bitebyte.entity.PreferenciasUsuario;
import com.tcc.bitebyte.entity.Usuario;
import com.tcc.bitebyte.repository.PreferenciasRepository;
import com.tcc.bitebyte.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PreferenciasService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PreferenciasRepository preferenciasRepository;

    public PreferenciasUsuario salvar(PreferenciasDTO dto) {

        Usuario usuario = usuarioRepository
                .findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Usuário não encontrado"));

        PreferenciasUsuario preferencias =
                preferenciasRepository
                        .findByUsuario(usuario)
                        .orElse(new PreferenciasUsuario());

        preferencias.setUsuario(usuario);

        preferencias.setTempoCozinhar(dto.getTempoCozinhar());
        preferencias.setHabilidade(dto.getHabilidade());
        preferencias.setOrcamento(dto.getOrcamento());
        preferencias.setPreferenciaSabor(dto.getPreferenciaSabor());
        preferencias.setExperimentarNovos(dto.getExperimentarNovos());
        preferencias.setStyleReceita(dto.getStyleReceita());
        preferencias.setCulinariaFavorita(dto.getCulinariaFavorita());
        preferencias.setDieta(dto.getDieta());
        preferencias.setObjetivoAlimentar(dto.getObjetivoAlimentar());
        preferencias.setPaladar(dto.getPaladar());
        preferencias.setAlergias(dto.getAlergias());

        usuario.setPossuiAlgoritmo(true);
        usuarioRepository.save(usuario);

        return preferenciasRepository.save(preferencias);
    }

    public PreferenciasUsuario buscarPorEmail(String email) {

        Usuario usuario = usuarioRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Usuário não encontrado"));

        return preferenciasRepository
                .findByUsuario(usuario)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Preferências não cadastradas"
                        ));
    }
}