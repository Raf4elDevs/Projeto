package com.tcc.bitebyte.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "preferencias_usuario")
public class PreferenciasUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    private String tempoCozinhar;
    private String habilidade;
    private String orcamento;
    private String preferenciaSabor;
    private String experimentarNovos;
    private String styleReceita;
    private String culinariaFavorita;
    private String dieta;
    private String objetivoAlimentar;
    private String paladar;
    private String alergias;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getTempoCozinhar() {
        return tempoCozinhar;
    }

    public void setTempoCozinhar(String tempoCozinhar) {
        this.tempoCozinhar = tempoCozinhar;
    }

    public String getHabilidade() {
        return habilidade;
    }

    public void setHabilidade(String habilidade) {
        this.habilidade = habilidade;
    }

    public String getOrcamento() {
        return orcamento;
    }

    public void setOrcamento(String orcamento) {
        this.orcamento = orcamento;
    }

    public String getPreferenciaSabor() {
        return preferenciaSabor;
    }

    public void setPreferenciaSabor(String preferenciaSabor) {
        this.preferenciaSabor = preferenciaSabor;
    }

    public String getExperimentarNovos() {
        return experimentarNovos;
    }

    public void setExperimentarNovos(String experimentarNovos) {
        this.experimentarNovos = experimentarNovos;
    }

    public String getStyleReceita() {
        return styleReceita;
    }

    public void setStyleReceita(String styleReceita) {
        this.styleReceita = styleReceita;
    }

    public String getCulinariaFavorita() {
        return culinariaFavorita;
    }

    public void setCulinariaFavorita(String culinariaFavorita) {
        this.culinariaFavorita = culinariaFavorita;
    }

    public String getDieta() {
        return dieta;
    }

    public void setDieta(String dieta) {
        this.dieta = dieta;
    }

    public String getObjetivoAlimentar() {
        return objetivoAlimentar;
    }

    public void setObjetivoAlimentar(String objetivoAlimentar) {
        this.objetivoAlimentar = objetivoAlimentar;
    }

    public String getPaladar() {
        return paladar;
    }

    public void setPaladar(String paladar) {
        this.paladar = paladar;
    }

    public String getAlergias() {
        return alergias;
    }

    public void setAlergias(String alergias) {
        this.alergias = alergias;
    }
}