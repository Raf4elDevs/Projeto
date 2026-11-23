package com.tcc.bitebyte.service;

import com.tcc.bitebyte.dto.LoginDTO;
import com.tcc.bitebyte.dto.LoginResponseDTO;
import com.tcc.bitebyte.dto.RegisterDTO;
import com.tcc.bitebyte.entity.Usuario;
import com.tcc.bitebyte.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String cadastrar(RegisterDTO dto) {

        if (repository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado");
        }

        Usuario usuario = new Usuario();

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());

        String senhaCriptografada =
                passwordEncoder.encode(dto.getSenha());

        usuario.setSenha(senhaCriptografada);

        usuario.setPossuiAlgoritmo(false);

        repository.save(usuario);

        return "CADASTRO REALIZADO";
    }

    public LoginResponseDTO login(LoginDTO dto) {

        Usuario usuario = repository
                .findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Usuário não encontrado"));

        boolean senhaCorreta =
                passwordEncoder.matches(
                        dto.getSenha(),
                        usuario.getSenha()
                );

        if (!senhaCorreta) {
            throw new RuntimeException("Senha inválida");
        }

        return new LoginResponseDTO(
                "LOGIN REALIZADO",
                usuario.getPossuiAlgoritmo(),
                usuario.getEmail()
        );
    }
}