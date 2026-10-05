const API = "http://localhost:8080";
const CLOUD_NAME = "ptoaofvd"; // cloud name
const UPLOAD_PRESET = "preset_biteByte"; // Seu Preset configurado

let adminLogado = false;
let uploadWidget;

// Tenta carregar as receitas ao abrir a página e inicializa o Cloudinary
document.addEventListener("DOMContentLoaded", () => {
    carregarReceitas();
    configurarEventosTabela();
    inicializarCloudinaryWidget();
});

// ========================================
// INTEGRACAO CLOUDINARY WIDGET
// ========================================

function inicializarCloudinaryWidget() {
    if (window.cloudinary) {
        uploadWidget = cloudinary.createUploadWidget({
            cloudName: CLOUD_NAME,
            uploadPreset: UPLOAD_PRESET,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            language: 'pt',
            text: {
                pt: {
                    menu: { files: 'Meus Arquivos' },
                    local: { browse: 'Procurar', dd_title_single: 'Arraste e solte a foto da receita aqui' }
                }
            }
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                const urlCloudinary = result.info.secure_url;
                atualizarPreviaImagem(urlCloudinary);
            }
        });

        const btnUpload = document.getElementById("btnUploadCloudinary");
        if (btnUpload) {
            btnUpload.addEventListener("click", () => {
                uploadWidget.open();
            });
        }
    }
}

function atualizarPreviaImagem(url) {
    const inputImage = document.getElementById("r_image");
    const preview = document.getElementById("r_image_preview");

    if (inputImage) inputImage.value = url || "";
    
    if (preview) {
        if (url) {
            preview.src = url;
            preview.style.display = "block";
        } else {
            preview.src = "";
            preview.style.display = "none";
        }
    }
}

// Elementos de Imagem
const r_image = document.getElementById("r_image");
const r_image_preview = document.getElementById("r_image_preview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const btnRemoveImage = document.getElementById("btnRemoveImage");

// Função centralizada para definir ou apagar a imagem da receita
function setRecipeImage(url) {
  if (url && url.trim() !== "") {
    r_image.value = url;
    r_image_preview.src = url;
    imagePreviewContainer.style.display = "inline-block"; // Exibe a prévia + o botão X
  } else {
    r_image.value = "";
    r_image_preview.src = "";
    imagePreviewContainer.style.display = "none"; // Esconde a prévia e o X
  }
}

// Clique no botão "X" para remover a imagem
if (btnRemoveImage) {
  btnRemoveImage.addEventListener("click", () => {
    setRecipeImage(""); // Limpa o campo e oculta a prévia
  });
}


// ========================================
// ESTILIZAÇÃO DO WIDGET DO CLOUDNARY(referente ao painel de imagem.)
// ========================================



// ========================================
// LOGIN / LOGOUT
// ========================================

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const usuario = document.getElementById("loginUser")?.value.trim();
        const senha = document.getElementById("loginPass")?.value;

        try {
            const response = await fetch(`${API}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    usuario: usuario,
                    username: usuario,
                    senha: senha,
                    password: senha
                })
            });

            const resultado = await response.json();

            if (response.ok && (resultado.sucesso || resultado.status === "ok")) {
                adminLogado = true;
                toggleLoginUI(true);
                mostrarMensagem("loginMsg", "Login realizado com sucesso!", "green");
                await carregarReceitas();
            } else {
                mostrarMensagem("loginMsg", resultado.mensagem || "Usuário ou senha incorretos.", "red");
            }
        } catch (error) {
            console.error("Erro no login:", error);
            mostrarMensagem("loginMsg", "Não foi possível conectar ao servidor.", "red");
        }
    });
}

const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        adminLogado = false;
        toggleLoginUI(false);
        mostrarMensagem("loginMsg", "Sessão encerrada.", "#6b7280");
    });
}

function toggleLoginUI(logado) {
    const adminName = document.getElementById("adminName");
    const btnLogoutEl = document.getElementById("btn-logout");
    const loginCard = document.getElementById("loginCard");

    if (logado) {
        if (adminName) adminName.classList.remove("hidden");
        if (btnLogoutEl) btnLogoutEl.classList.remove("hidden");
        if (loginCard) loginCard.style.display = "none";
    } else {
        if (adminName) adminName.classList.add("hidden");
        if (btnLogoutEl) btnLogoutEl.classList.add("hidden");
        if (loginCard) loginCard.style.display = "block";
    }
}

// ========================================
// LISTAR E RENDERIZAR RECEITAS
// ========================================

async function carregarReceitas() {
    try {
        const response = await fetch(`${API}/recipes`, { credentials: "include" });

        if (!response.ok) throw new Error("Erro ao carregar receitas.");

        const receitas = await response.json();
        renderizarReceitas(receitas);
    } catch (error) {
        console.error(error);
        mostrarMensagem("adminMsg", "Erro ao carregar receitas.", "red");
    }
}

function renderizarReceitas(receitas) {
    const container = document.getElementById("recipeList");
    if (!container) return;

    container.innerHTML = "";

    if (!receitas || receitas.length === 0) {
        container.innerHTML = "<p style='color: #6b7280;'>Nenhuma receita cadastrada.</p>";
        return;
    }

    receitas.forEach(receita => {
        const titulo = receita.titulo || receita.title || "Sem título";
        const categoria = receita.categoria || receita.category || "";
        const tempo = receita.tempo || receita.time || "";
        const id = receita.id;

        const div = document.createElement("div");
        div.className = "recipe-admin-item";
        div.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            margin-bottom: 8px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #fff;
        `;

        div.innerHTML = `
            <div>
                <strong>${escapeHtml(titulo)}</strong>
                <br>
                <small style="color: #6b7280;">
                    ${escapeHtml(categoria)} ${tempo ? "• " + escapeHtml(tempo) : ""}
                </small>
            </div>
            <div style="display: flex; gap: 6px;">
                <button class="btn btn-editar" data-id="${id}">Editar</button>
                <button class="btn btn-excluir" data-id="${id}">Excluir</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function configurarEventosTabela() {
    const container = document.getElementById("recipeList");
    if (!container) return;

    container.addEventListener("click", (e) => {
        const target = e.target;
        const id = target.getAttribute("data-id");

        if (target.classList.contains("btn-editar") && id) {
            editarReceita(id);
        } else if (target.classList.contains("btn-excluir") && id) {
            excluirReceita(id);
        }
    });
}

// ========================================
// CRIAR / SALVAR
// ========================================

const saveBtn = document.getElementById("saveBtn");
if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
        const dados = pegarDadosFormulario();

        if (!dados.titulo && !dados.title) {
            mostrarMensagem("adminMsg", "Digite o título da receita.", "red");
            return;
        }

        try {
            const response = await fetch(`${API}/recipes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                mostrarMensagem("adminMsg", "Receita criada com sucesso!", "green");
                limparFormulario();
                await carregarReceitas();
            } else {
                mostrarMensagem("adminMsg", "Erro ao salvar receita. Faça o login novamente.", "red");
            }
        } catch (error) {
            console.error(error);
            mostrarMensagem("adminMsg", "Erro de conexão com o servidor.", "red");
        }
    });
}

// ========================================
// EDITAR E ATUALIZAR
// ========================================

async function editarReceita(id) {
    try {
        const response = await fetch(`${API}/recipes/${id}`, { credentials: "include" });
        if (!response.ok) throw new Error();

        const receita = await response.json();

        if (document.getElementById("r_id")) document.getElementById("r_id").value = receita.id;
        if (document.getElementById("r_title")) document.getElementById("r_title").value = receita.titulo || receita.title || "";
        if (document.getElementById("r_category")) document.getElementById("r_category").value = receita.categoria || receita.category || "";
        if (document.getElementById("r_time")) document.getElementById("r_time").value = receita.tempo || receita.time || "";
        if (document.getElementById("r_difficulty")) document.getElementById("r_difficulty").value = receita.dificuldade || receita.difficulty || "";
        if (document.getElementById("r_excerpt")) document.getElementById("r_excerpt").value = receita.resumo || receita.excerpt || "";
        if (document.getElementById("r_ingredients")) document.getElementById("r_ingredients").value = receita.ingredientes || receita.ingredients || "";
        if (document.getElementById("r_steps")) document.getElementById("r_steps").value = receita.passos || receita.steps || "";

        // Atualiza a imagem e a prévia visual
        const imageUrl = receita.imagem || receita.image || "";
        atualizarPreviaImagem(imageUrl);

        const btnSave = document.getElementById("saveBtn");
        const btnUpdate = document.getElementById("updateBtn");

        if (btnSave) btnSave.style.display = "none";
        if (btnUpdate) btnUpdate.style.display = "inline-block";

        mostrarMensagem("adminMsg", "Modo de edição ativo.", "#2563eb");
    } catch (error) {
        console.error(error);
        mostrarMensagem("adminMsg", "Erro ao carregar a receita selecionada.", "red");
    }
}

const updateBtn = document.getElementById("updateBtn");
if (updateBtn) {
    updateBtn.addEventListener("click", async () => {
        const id = document.getElementById("r_id")?.value;
        if (!id) return;

        const dados = pegarDadosFormulario();

        try {
            const response = await fetch(`${API}/recipes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                mostrarMensagem("adminMsg", "Receita atualizada com sucesso!", "green");
                limparFormulario();
                await carregarReceitas();
            } else {
                mostrarMensagem("adminMsg", "Erro ao atualizar receita.", "red");
            }
        } catch (error) {
            console.error(error);
            mostrarMensagem("adminMsg", "Erro de conexão com o servidor.", "red");
        }
    });
}

// ========================================
// EXCLUIR
// ========================================

async function excluirReceita(id) {
    if (!confirm("Tem certeza que deseja excluir esta receita?")) return;

    try {
        const response = await fetch(`${API}/recipes/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (response.ok) {
            mostrarMensagem("adminMsg", "Receita excluída!", "green");
            await carregarReceitas();
        } else {
            mostrarMensagem("adminMsg", "Não autorizado ou erro ao excluir.", "red");
        }
    } catch (error) {
        console.error(error);
        mostrarMensagem("adminMsg", "Erro de conexão.", "red");
    }
}

// ========================================
// BUSCAR RECEITAS
// ========================================

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

if (searchBtn) searchBtn.addEventListener("click", buscarReceitas);
if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") buscarReceitas();
    });
}

async function buscarReceitas() {
    const termo = document.getElementById("searchInput")?.value.trim();

    if (!termo) {
        await carregarReceitas();
        return;
    }

    try {
        const response = await fetch(`${API}/recipes/search?q=${encodeURIComponent(termo)}`, {
            credentials: "include"
        });
        
        if (!response.ok) throw new Error("Erro na busca.");

        const receitas = await response.json();
        renderizarReceitas(receitas);
    } catch (error) {
        console.error(error);
        mostrarMensagem("adminMsg", "Erro ao realizar busca.", "red");
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function pegarDadosFormulario() {
    const title = document.getElementById("r_title")?.value.trim() || "";
    const category = document.getElementById("r_category")?.value.trim() || "";
    const time = document.getElementById("r_time")?.value.trim() || "";
    const difficulty = document.getElementById("r_difficulty")?.value.trim() || "";
    const image = document.getElementById("r_image")?.value.trim() || "";
    const excerpt = document.getElementById("r_excerpt")?.value.trim() || "";
    const ingredients = document.getElementById("r_ingredients")?.value.trim() || "";
    const steps = document.getElementById("r_steps")?.value.trim() || "";

    return {
        titulo: title, title: title,
        categoria: category, category: category,
        tempo: time, time: time,
        dificuldade: difficulty, difficulty: difficulty,
        imagem: image, image: image,
        resumo: excerpt, excerpt: excerpt,
        ingredientes: ingredients, ingredients: ingredients,
        passos: steps, steps: steps
    };
}

const clearBtn = document.getElementById("clearBtn");
if (clearBtn) clearBtn.addEventListener("click", limparFormulario);

function limparFormulario() {
    const recipeForm = document.getElementById("recipeForm");
    if (recipeForm) recipeForm.reset();

    if (document.getElementById("r_id")) document.getElementById("r_id").value = "";
    
    // Limpa a prévia da imagem
    atualizarPreviaImagem("");

    const btnSave = document.getElementById("saveBtn");
    const btnUpdate = document.getElementById("updateBtn");

    if (btnSave) btnSave.style.display = "inline-block";
    if (btnUpdate) btnUpdate.style.display = "none";
}

function mostrarMensagem(elementId, texto, cor) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = texto;
        el.style.color = cor;
    }
}

function escapeHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto || "";
    return div.innerHTML;
}