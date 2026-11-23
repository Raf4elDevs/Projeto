document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    const alertaMsg = document.getElementById('alerta-msg');

    // Variável global para armazenar o e-mail durante o fluxo (Cadastro ou Login) -> Questionário
    let emailUsuarioLogado = "";

    // 1. Alternar entre abas (Login/Cadastro)
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            ocultarAlerta(); 

            tab.classList.add('active');
            const targetForm = tab.getAttribute('data-target');
            document.getElementById(`form-${targetForm}`).classList.add('active');
            
            // Garante que o menu lateral continue visível se o usuário alternar manualmente
            document.querySelector('.auth-menu').style.display = 'flex';
        });
    });

    // 2. Logo redireciona para Home
    document.getElementById('logo-home').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // 3. Mostrar/Ocultar Senha
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const inputId = this.getAttribute('data-target');
            const input = document.getElementById(inputId);

            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // 4. Sistema de Alertas
    function mostrarAlerta(mensagem, tipo) {
        alertaMsg.textContent = mensagem; // Corrigido aqui (removido o "message =")
        alertaMsg.className = `alerta ${tipo}`;
        setTimeout(ocultarAlerta, 5000);
    }

    function ocultarAlerta() {
        alertaMsg.className = 'alerta oculta';
    }

    // 5. Requisição de Cadastro (POST) -> Avança para o Questionário
    document.getElementById('form-register').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const emailInput = document.getElementById('reg-email').value.trim();
        const dados = {
            nome: document.getElementById('reg-nome').value.trim(),
            email: emailInput,
            senha: document.getElementById('reg-senha').value.trim()
        };

        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                mostrarAlerta("Conta criada! Agora, personalize sua experiência.", "sucesso");
                
                // Guarda o e-mail para usar na requisição das preferências
                emailUsuarioLogado = emailInput;

                // mantém apenas o e-mail salvo; preferências serão definidas no onboarding
                localStorage.setItem('usuarioLogado', emailInput);

                // Transição estilo Pinterest: Esconde o formulário de cadastro e ativa o questionário
                document.getElementById('form-register').classList.remove('active');
                document.getElementById('form-onboarding').classList.add('active');
                
                // Oculta temporariamente o menu de abas para focar no questionário
                document.querySelector('.auth-menu').style.display = 'none';
                
                document.getElementById('form-register').reset();
            } else {
                mostrarAlerta("Erro: E-mail já cadastrado ou dados inválidos.", "erro");
            }
        } catch (error) {
            mostrarAlerta("Servidor offline ou erro de rede.", "erro");
        }
    });

    // 5.5 LÓGICA CONDICIONAL: Mostrar/Esconder campo Dropdown de Alergias
    const selectPossuiAlergia = document.getElementById('onb-possui-alergia');
    const wrapperAlergias = document.getElementById('wrapper-alergias');

    if (selectPossuiAlergia && wrapperAlergias) {
        selectPossuiAlergia.addEventListener('change', () => {
            if (selectPossuiAlergia.value === 'sim') {
                wrapperAlergias.classList.remove('oculta');
            } else {
                wrapperAlergias.classList.add('oculta');
            }
        });
    }

    // 5.6 Envio do Questionário Customizado para o Banco (POST)
    document.getElementById('form-onboarding').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Determina o valor do campo de alergias com base na resposta anterior
        const temAlergia = selectPossuiAlergia.value === 'sim';
        const alergiaSelecionada = temAlergia ? document.getElementById('onb-qual-alergia').value : "nenhuma";

        // Monta o objeto com todas as respostas mapeadas exatamente como no seu HTML
        const preferencias = {
            email: emailUsuarioLogado, // Enviando o e-mail capturado no login ou cadastro
            tempoCozinhar: document.getElementById('onb-tempo').value,
            habilidade: document.getElementById('onb-habilidade').value,
            orcamento: document.getElementById('onb-orcamento').value,
            preferenciaSabor: document.getElementById('onb-preferencia-sabor').value,
            experimentarNovos: document.getElementById('onb-experimentar').value,
            styleReceita: document.getElementById('onb-estilo-receita').value,
            culinariaFavorita: document.getElementById('onb-culinaria').value,
            dieta: document.getElementById('onb-dieta').value,
            objetivoAlimentar: document.getElementById('onb-objetivo').value,
            paladar: document.getElementById('onb-paladar').value,
            alergias: alergiaSelecionada
        };

        try {
            const response = await fetch('http://localhost:8080/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferencias)
            });

            if (response.ok) {
                mostrarAlerta("BiteByte personalizado! Entrando...", "sucesso");
                
                // Efetua o login automático no navegador salvando a referência do usuário
                localStorage.setItem('usuarioLogado', emailUsuarioLogado); 
                
                // Redireciona para o feed personalizado
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                mostrarAlerta("Erro ao salvar suas preferências.", "erro");
            }
        } catch (error) {
            mostrarAlerta("Erro de conexão ao salvar questionário.", "erro");
        }
    });
// 6. Requisição de Login (POST)
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value.trim();

    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput,
                senha: senha
            })
        });

        // O backend agora retorna JSON
        const resultado = await response.json();

        if (response.ok && resultado.mensagem === "LOGIN REALIZADO") {

            // Guarda o e-mail do usuário
            emailUsuarioLogado = resultado.email;

            // Salva o usuário no navegador
            localStorage.setItem(
                'usuarioLogado',
                resultado.email
            );

            // Verifica se o usuário já respondeu ao questionário
            if (resultado.possuiAlgoritmo === false) {

                mostrarAlerta(
                    "Login bem-sucedido! Responda ao questionário.",
                    "sucesso"
                );

                // Esconde o formulário de login
                document
                    .getElementById('form-login')
                    .classList.remove('active');

                // Mostra o questionário
                document
                    .getElementById('form-onboarding')
                    .classList.add('active');

                // Esconde as abas Login/Cadastro
                document.querySelector('.auth-menu')
                    .style.display = 'none';

                // Limpa o formulário de login
                document
                    .getElementById('form-login')
                    .reset();

            } else {

                // Usuário já possui preferências
                mostrarAlerta(
                    "Login realizado! Entrando...",
                    "sucesso"
                );

                // Vai direto para o site
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }

        } else {

            mostrarAlerta(
                "E-mail ou senha incorretos.",
                "erro"
            );
        }

    } catch (error) {

        console.error("Erro no login:", error);

        mostrarAlerta(
            "Servidor offline ou erro de conexão.",
            "erro"
        );
    }
});
});
