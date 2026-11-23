# BiteByte

Site de receitas do projeto de TCC BiteByte, com front-end em HTML/CSS/JS e back-end em Spring Boot (Java) com MySQL.

## Estrutura

```
bitebyte/
├── index.html        # redireciona para o site (usado pelo GitHub Pages)
├── front_end/        # páginas, estilos e scripts
│   ├── html/
│   ├── css/
│   ├── js/
│   └── assets/
└── back_end/         # API Spring Boot
    ├── pom.xml
    └── src/
```

## Site online (GitHub Pages)

O front-end é estático e fica publicado pelo GitHub Pages. As telas aparecem normalmente, mas login, cadastro, receitas e admin dependem do back-end rodando e **não funcionam online enquanto o back-end estiver apenas no seu computador**.

## Como rodar localmente

### Back-end
Requisitos: Java 21, Maven e MySQL.

1. Confira o usuário e a senha do MySQL em `back_end/src/main/resources/application.properties` (são valores fictícios, de teste) e ajuste para o seu MySQL local.
2. Na pasta `back_end`, rode:
   ```bash
   mvn spring-boot:run
   ```
   A API sobe em `http://localhost:8080`.

### Front-end
Abra `front_end/html/index.html` no navegador, ou use o servidor Node incluído:

```bash
cd front_end
npm install
npm start
```

O site fica em `http://localhost:3000/html/index.html`.

## Segurança

- As senhas do `application.properties` são fictícias e servem apenas para testes e simulação. Em um sistema real, use variáveis de ambiente.
- O arquivo `.gitignore` bloqueia `.env`, `target/`, `node_modules/` e bancos locais.
