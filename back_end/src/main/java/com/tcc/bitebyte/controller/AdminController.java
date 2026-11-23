package com.tcc.bitebyte.controller;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(
        origins = {
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        },
        allowCredentials = "true"
)
public class AdminController {

    @Value("${admin.user}")
    private String adminUser;

    @Value("${admin.password}")
    private String adminPassword;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody AdminLoginRequest request,
            HttpSession session
    ) {

        if (
                adminUser.equals(request.getUsuario())
                        &&
                        adminPassword.equals(request.getSenha())
        ) {

            session.setAttribute("ADMIN_LOGADO", true);

            return ResponseEntity.ok(
                    new AdminResponse(
                            true,
                            "LOGIN REALIZADO"
                    )
            );
        }

        return ResponseEntity
                .status(401)
                .body(
                        new AdminResponse(
                                false,
                                "USUÁRIO OU SENHA INCORRETOS"
                        )
                );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpSession session
    ) {

        session.invalidate();

        return ResponseEntity.ok(
                new AdminResponse(
                        true,
                        "LOGOUT REALIZADO"
                )
        );
    }

    @GetMapping("/status")
    public ResponseEntity<?> status(
            HttpSession session
    ) {

        Boolean logado =
                (Boolean) session.getAttribute("ADMIN_LOGADO");

        if (Boolean.TRUE.equals(logado)) {

            return ResponseEntity.ok(
                    new AdminResponse(
                            true,
                            "ADMIN LOGADO"
                    )
            );
        }

        return ResponseEntity
                .status(401)
                .body(
                        new AdminResponse(
                                false,
                                "NÃO AUTORIZADO"
                        )
                );
    }

    public static class AdminLoginRequest {

        private String usuario;
        private String senha;

        public String getUsuario() {
            return usuario;
        }

        public void setUsuario(String usuario) {
            this.usuario = usuario;
        }

        public String getSenha() {
            return senha;
        }

        public void setSenha(String senha) {
            this.senha = senha;
        }
    }

    public static class AdminResponse {

        private boolean sucesso;
        private String mensagem;

        public AdminResponse(
                boolean sucesso,
                String mensagem
        ) {
            this.sucesso = sucesso;
            this.mensagem = mensagem;
        }

        public boolean isSucesso() {
            return sucesso;
        }

        public String getMensagem() {
            return mensagem;
        }
    }
}