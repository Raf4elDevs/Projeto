package com.tcc.bitebyte.dto;

public class LoginResponseDTO {

    private String mensagem;
    private Boolean possuiAlgoritmo;
    private String email;

    public LoginResponseDTO(
            String mensagem,
            Boolean possuiAlgoritmo,
            String email
    ) {
        this.mensagem = mensagem;
        this.possuiAlgoritmo = possuiAlgoritmo;
        this.email = email;
    }

    public String getMensagem() {
        return mensagem;
    }

    public Boolean getPossuiAlgoritmo() {
        return possuiAlgoritmo;
    }

    public String getEmail() {
        return email;
    }
}