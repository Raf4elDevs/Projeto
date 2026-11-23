/* ==========================================================================
   script.js - Centralizador de Comportamentos e Integração com Backend
   ========================================================================== */

const API = "http://localhost:8080";

// ---------- Helpers DOM ----------
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

function navigate(href) {
    if (!href) return;
    window.location.href = href;
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ---------- Carrossel (Slideshow) ----------
function initCarousel(selector = '.carousel-slide', prevBtnSel = '#slide-prev', nextBtnSel = '#slide-next', interval = 6000) {
    const slides = $$(selector);
    if (!slides.length) return null;
    let idx = 0;

    function show(i) {
        slides.forEach(s => s.classList.remove('active'));
        idx = (i + slides.length) % slides.length;
        slides[idx].classList.add('active');
    }

    const prevBtn = document.getElementById(prevBtnSel.replace('#',''));
    const nextBtn = document.getElementById(nextBtnSel.replace('#',''));
    if (prevBtn) prevBtn.addEventListener('click', () => show(idx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => show(idx + 1));

    const timer = setInterval(() => show(idx + 1), interval);
    return { show, stop: () => clearInterval(timer) };
}

// ---------- Chat Interface ----------
function toggleChatWindow() {
    const win = $('#ai-chat-window');
    if (win) win.classList.toggle('chat-hidden');
}

function sendIndexChat() {
    const input = $('#user-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    const container = $('#chat-messages');
    if (container) {
        const div = document.createElement('div');
        div.className = 'message user-msg';
        div.textContent = text;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
    input.value = '';
    setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'message ai-msg';
        div.textContent = 'Resposta automática (mock) do BiteByte.';
        if (container) {
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }
    }, 600);
}

function sendBiteByteMessage() {
    const input = $('#mensagem');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    const chatArea = $('#chat');
    if (chatArea) {
        const item = document.createElement('div');
        item.className = 'user-message';
        item.innerHTML = `<strong>Você:</strong> <div class="msg-bubble">${escapeHtml(text)}</div>`;
        chatArea.appendChild(item);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    input.value = '';
}

// ---------- Renderização e Filtros de Receitas Públicas ----------
let currentRecipes = [];
let currentFilter = 'all';

function renderEmptyRecipesState(containerId = 'recipe-grid', message = 'Nenhuma receita disponível no momento.') {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = `<div class="empty-state" style="text-align:center;padding:32px 0;color:#666;">${message}</div>`;
}

function normalizeCategory(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function matchesCategory(recipe, category) {
    if (!category || category === 'all') return true;
    const selected = normalizeCategory(category);
    const recipeCategory = normalizeCategory(recipe.category || recipe.categoria || '');
    if (!selected || !recipeCategory) return true;
    return recipeCategory.includes(selected) || selected.includes(recipeCategory);
}

function matchesSearch(recipe, searchTerm) {
    const term = String(searchTerm || '').trim().toLowerCase();
    if (!term) return true;

    const title = String(recipe.title || recipe.titulo || '').toLowerCase();
    const excerpt = String(recipe.excerpt || recipe.resumo || '').toLowerCase();
    return title.includes(term) || excerpt.includes(term);
}

function renderRecipeCards(recipes, options = {}) {
    const grid = document.getElementById(options.containerId || 'recipe-grid');
    if (!grid) return;

    const categoryFilter = options.filter || 'all';
    const searchTerm = options.search || '';

    const filtered = recipes.filter((recipe) => {
        const matchesCategoryResult = categoryFilter && categoryFilter !== 'all'
            ? matchesCategory(recipe, categoryFilter)
            : true;
        const matchesSearchResult = matchesSearch(recipe, searchTerm);
        return matchesCategoryResult && matchesSearchResult;
    });

    const limited = typeof options.limit === 'number' ? filtered.slice(0, options.limit) : filtered;

    if (!limited.length) {
        renderEmptyRecipesState(options.containerId || 'recipe-grid', options.emptyMessage || 'Nenhuma receita disponível no momento.');
        return;
    }

    grid.innerHTML = '';
    limited.forEach((recipe) => {
        const title = recipe.title || recipe.titulo || 'Sem título';
        const category = recipe.category || recipe.categoria || 'Receita';
        const time = recipe.time || recipe.tempo || '—';
        const difficulty = recipe.difficulty || recipe.dificuldade || '—';
        const image = recipe.image || recipe.imagem || 'https://via.placeholder.com/300x200?text=BiteByte';

        const art = document.createElement('article');
        art.className = 'recipe-card';
        art.dataset.id = recipe.id;
        art.innerHTML = `
            <div class="img-container">
                <img src="${image}" alt="${escapeHtml(title)}">
            </div>
            <div class="card-info">
                <span class="category-name">${escapeHtml(category)}</span>
                <h4>${escapeHtml(title)}</h4>
                <div class="meta">
                    <span><i class="far fa-clock"></i> ${escapeHtml(time)}</span>
                    <span><i class="fas fa-fire"></i> ${escapeHtml(difficulty)}</span>
                </div>
            </div>
        `;
        art.addEventListener('click', () => {
            if (recipe.id) {
                abrirModalReceita(recipe.id);
            }
        });
        grid.appendChild(art);
    });
}

function initRecipeFilters() {
    const buttons = Array.from(document.querySelectorAll('.filter-btn'));
    const searchForm = document.getElementById('recipe-search-form');
    const searchInput = document.getElementById('recipe-search');
    if (!buttons.length) return;

    const applyFilter = (category, searchValue = '') => {
        currentFilter = category || 'all';
        buttons.forEach((button) => {
            button.classList.toggle('active', (button.dataset.filter || 'all') === currentFilter);
        });
        renderRecipeCards(currentRecipes, {
            containerId: 'recipe-grid',
            filter: currentFilter,
            search: searchValue
        });
    };

    buttons.forEach((button) => {
        button.addEventListener('click', () => applyFilter(button.dataset.filter || 'all', searchInput ? searchInput.value : ''));
    });

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            applyFilter(currentFilter, searchInput.value);
        });

        searchInput.addEventListener('input', () => {
            applyFilter(currentFilter, searchInput.value);
        });
    }

    applyFilter(currentFilter, searchInput ? searchInput.value : '');
}

async function loadRecipesFromAPI(options = {}) {
    const containerId = options.containerId || 'recipe-grid';
    const grid = document.getElementById(containerId);
    if (!grid) return;

    grid.innerHTML = '<div class="empty-state" style="text-align:center;padding:32px 0;color:#666;">Carregando receitas...</div>';
    try {
        const res = await fetch(`${API}/recipes`);
        if (!res.ok) throw new Error('Falha ao buscar receitas');
        const recipes = await res.json();
        currentRecipes = Array.isArray(recipes) ? recipes : [];

        if (options.filterable) {
            initRecipeFilters();
            return;
        }

        renderRecipeCards(currentRecipes, {
            containerId,
            filter: 'all',
            limit: typeof options.limit === 'number' ? options.limit : undefined
        });
    } catch (err) {
        console.error(err);
        renderEmptyRecipesState(containerId, 'Não foi possível carregar as receitas no momento.');
    }
}

// ---------- Detalhes da Receita (receita.html) ----------
async function loadRecipeDetail() {
    const container = document.getElementById('recipe-detail');
    if (!container) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        container.innerHTML = '<p style="text-align:center;padding:24px 0;color:#666;">ID da receita não fornecido.</p>';
        return;
    }

    container.innerHTML = '<p style="text-align:center;padding:24px 0;color:#666;">Carregando receita...</p>';

    try {
        const res = await fetch(`${API}/recipes/${encodeURIComponent(id)}`);
        if (res.status === 404) {
            container.innerHTML = '<p style="text-align:center;padding:24px 0;color:#666;">Receita não encontrada.</p>';
            return;
        }
        if (!res.ok) throw new Error('Erro ao buscar receita');
        const recipe = await res.json();

        const title = recipe.title || recipe.titulo || 'Sem título';
        const category = recipe.category || recipe.categoria || 'Receita';
        const time = recipe.time || recipe.tempo || '—';
        const difficulty = recipe.difficulty || recipe.dificuldade || '—';
        const image = recipe.image || recipe.imagem || 'https://via.placeholder.com/400';
        const excerpt = recipe.excerpt || recipe.resumo || '';

        const ingredientsStr = recipe.ingredients || recipe.ingredientes || '';
        const stepsStr = recipe.steps || recipe.passos || '';

        const ingredients = ingredientsStr.split(';').map(i => i.trim()).filter(Boolean);
        const steps = stepsStr.split(';').map(s => s.trim()).filter(Boolean);

        container.innerHTML = `
            <header style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
                <img src="${image}" alt="${escapeHtml(title)}" style="width:min(100%, 320px);border-radius:12px;object-fit:cover;">
                <div style="flex:1;min-width:260px;">
                    <h1 style="margin:0 0 8px;">${escapeHtml(title)}</h1>
                    <p style="margin:0 0 6px;color:#666;">${escapeHtml(category)} • ${escapeHtml(time)} • ${escapeHtml(difficulty)}</p>
                    <p style="margin-top:12px;color:#444;">${escapeHtml(excerpt)}</p>
                </div>
            </header>
            <section style="margin-top:24px;display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));">
                <div>
                    <h2>Ingredientes</h2>
                    <ul>
                        ${ingredients.length ? ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('') : '<li>Nenhum ingrediente informado.</li>'}
                    </ul>
                </div>
                <div>
                    <h2>Modo de preparo</h2>
                    <ol>
                        ${steps.length ? steps.map(s => `<li>${escapeHtml(s)}</li>`).join('') : '<li>Nenhum passo informado.</li>'}
                    </ol>
                </div>
            </section>
        `;
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="text-align:center;padding:24px 0;color:#666;">Erro ao carregar a receita.</p>';
    }
}

// ---------- Módulo Admin + API Fetch ----------
function getAdminToken() {
    return localStorage.getItem('adminToken');
}

async function apiFetch(path, opts = {}) {
    opts.headers = opts.headers || {};
    if (!opts.headers['Content-Type'] && !(opts.body instanceof FormData)) {
        opts.headers['Content-Type'] = 'application/json';
    }
    opts.credentials = opts.credentials || 'include';
    const token = getAdminToken();
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    
    const url = path.startsWith('http') ? path : `${API}${path}`;
    return fetch(url, opts);
}

async function adminLogin(user, pass) {
    try {
        const res = await fetch(`${API}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ usuario: user, username: user, senha: pass, password: pass })
        });

        if (!res.ok) {
            let msg = res.statusText;
            try {
                const errJson = await res.json();
                msg = errJson.mensagem || errJson.error || msg;
            } catch (_) {}
            return { ok: false, status: res.status, message: msg };
        }

        const j = await res.json();
        if (j.token) localStorage.setItem('adminToken', j.token);
        return { ok: true };
    } catch (err) {
        return { ok: false, status: 0, message: 'Não foi possível conectar ao servidor.' };
    }
}

function adminLogout() {
    localStorage.removeItem('adminToken');
    showAdminState(false);
}

function showAdminState(logged) {
    const logoutBtn = document.getElementById('btn-logout');
    const loginCard = document.getElementById('loginCard');
    const adminMsg = document.getElementById('adminMsg');
    if (logoutBtn) logoutBtn.style.display = logged ? 'inline-block' : 'none';
    if (loginCard) loginCard.style.display = logged ? 'none' : 'block';
    if (adminMsg) adminMsg.textContent = '';
}

async function loadAdminRecipes(query = '') {
    const list = document.getElementById('recipeList');
    if (!list) return;
    list.innerHTML = '<p>Carregando...</p>';
    try {
        let endpoint = query ? `/recipes/search?q=${encodeURIComponent(query)}` : '/recipes';
        const res = await apiFetch(endpoint, { method: 'GET' });
        if (!res.ok) throw new Error('Erro ao buscar receitas');
        const recipes = await res.json();
        renderRecipeList(recipes);
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p>Erro ao carregar receitas.</p>';
    }
}

function renderRecipeList(recipes) {
    const list = document.getElementById('recipeList');
    if (!list) return;
    if (!recipes || !recipes.length) return (list.innerHTML = '<p>Nenhuma receita encontrada.</p>');
    list.innerHTML = '';
    recipes.forEach(r => {
        const title = r.title || r.titulo || 'Sem título';
        const category = r.category || r.categoria || '';
        const image = r.image || r.imagem || 'https://via.placeholder.com/80';

        const el = document.createElement('div');
        el.className = 'admin-recipe-item';
        el.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #eee;';
        el.innerHTML = `
            <div style="display:flex;gap:12px;align-items:center;">
                <img src="${image}" alt="" style="width:64px;height:48px;object-fit:cover;border-radius:6px;">
                <div>
                  <strong>${escapeHtml(title)}</strong><br>
                  <small style="color:#666;">${escapeHtml(category)}</small>
                </div>
            </div>
            <div>
                <button class="btn" data-id="${r.id}" data-action="edit">Editar</button>
            </div>
        `;
        list.appendChild(el);
    });

    list.querySelectorAll('button[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            await loadRecipeIntoForm(id);
        });
    });
}

async function loadRecipeIntoForm(id) {
    try {
        const res = await apiFetch(`/recipes/${encodeURIComponent(id)}`);
        if (!res.ok) return alert('Não foi possível carregar a receita');
        const r = await res.json();

        if ($('#r_id')) $('#r_id').value = r.id;
        if ($('#r_title')) $('#r_title').value = r.title || r.titulo || '';
        if ($('#r_category')) $('#r_category').value = r.category || r.categoria || '';
        if ($('#r_time')) $('#r_time').value = r.time || r.tempo || '';
        if ($('#r_difficulty')) $('#r_difficulty').value = r.difficulty || r.dificuldade || '';
        if ($('#r_image')) $('#r_image').value = r.image || r.imagem || '';
        if ($('#r_excerpt')) $('#r_excerpt').value = r.excerpt || r.resumo || '';
        if ($('#r_ingredients')) $('#r_ingredients').value = r.ingredients || r.ingredientes || '';
        if ($('#r_steps')) $('#r_steps').value = r.steps || r.passos || '';

        if ($('#saveBtn')) $('#saveBtn').style.display = 'none';
        if ($('#updateBtn')) $('#updateBtn').style.display = 'inline-block';
        if ($('#adminMsg')) $('#adminMsg').textContent = 'Editando receita ID ' + r.id;
    } catch (err) {
        console.error(err);
        alert('Erro ao carregar a receita');
    }
}

function clearAdminForm() {
    ['r_id','r_title','r_category','r_time','r_difficulty','r_image','r_excerpt','r_ingredients','r_steps'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    if ($('#saveBtn')) $('#saveBtn').style.display = 'inline-block';
    if ($('#updateBtn')) $('#updateBtn').style.display = 'none';
    if ($('#adminMsg')) $('#adminMsg').textContent = '';
}

function getFormData() {
    const title = $('#r_title')?.value.trim() || '';
    const category = $('#r_category')?.value.trim() || '';
    const time = $('#r_time')?.value.trim() || '';
    const difficulty = $('#r_difficulty')?.value.trim() || '';
    const image = $('#r_image')?.value.trim() || '';
    const excerpt = $('#r_excerpt')?.value.trim() || '';
    const ingredients = $('#r_ingredients')?.value.trim() || '';
    const steps = $('#r_steps')?.value.trim() || '';

    return {
        title, titulo: title,
        category, categoria: category,
        time, tempo: time,
        difficulty, dificuldade: difficulty,
        image, imagem: image,
        excerpt, resumo: excerpt,
        ingredients, ingredientes: ingredients,
        steps, passos: steps
    };
}

async function submitNewRecipe() {
    const data = getFormData();
    try {
        const res = await apiFetch('/recipes', { method: 'POST', body: JSON.stringify(data) });
        if (res.status === 401) return alert('Não autorizado. Faça login.');
        if (!res.ok) throw new Error('Erro ao salvar');
        const j = await res.json();
        if ($('#adminMsg')) $('#adminMsg').textContent = 'Receita salva (ID ' + (j.id || '') + ')';
        clearAdminForm();
        loadAdminRecipes();
    } catch (err) {
        console.error(err);
        if ($('#adminMsg')) $('#adminMsg').textContent = 'Erro ao salvar receita.';
    }
}

async function updateExistingRecipe() {
    const id = $('#r_id')?.value;
    if (!id) return alert('ID inválido para atualização');
    const data = getFormData();
    try {
        const res = await apiFetch(`/recipes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
        if (res.status === 401) return alert('Não autorizado. Faça login.');
        if (!res.ok) throw new Error('Erro ao atualizar');
        if ($('#adminMsg')) $('#adminMsg').textContent = 'Receita atualizada com sucesso.';
        clearAdminForm();
        loadAdminRecipes();
    } catch (err) {
        console.error(err);
        if ($('#adminMsg')) $('#adminMsg').textContent = 'Erro ao atualizar receita.';
    }
}

// ---------- Evento Principal DOMContentLoaded ----------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrossel
    initCarousel();

    // 2. Detalhes de receita individual
    loadRecipeDetail();

    // 3. Grid e filtro de receitas (Página Principal)
    if (document.getElementById('recipe-grid')) {
        loadRecipesFromAPI({
            containerId: 'recipe-grid',
            filterable: !!document.querySelector('.filter-btn'),
            limit: document.querySelector('.filter-btn') ? undefined : 3
        });
    }

    // 4. Mobile Nav Toggle
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const open = mainNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        });
    }

    // 5. Redirecionamento da Logo
    const logoEls = Array.from(document.querySelectorAll('.logo, [id^="logo-"]'));
    logoEls.forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => navigate('index.html'));
    });

    // 6. Eventos do Chat
    const floatBtn = document.getElementById('ai-floating-btn');
    const closeBtn = document.getElementById('close-chat-btn');
    if (floatBtn) floatBtn.addEventListener('click', toggleChatWindow);
    if (closeBtn) closeBtn.addEventListener('click', toggleChatWindow);

    const sendIdx = $('#send-btn');
    if (sendIdx) sendIdx.addEventListener('click', sendIndexChat);

    const sendBite = $('#btn-enviar');
    if (sendBite) sendBite.addEventListener('click', sendBiteByteMessage);

    // 7. Estado de Login no Header
    const chatWrapper = $('#ai-chat-wrapper');
    const btnHeaderLogin = document.querySelector('.btn-login-header');
    const emailLogado = localStorage.getItem('usuarioLogado');
    if (emailLogado) {
        if (chatWrapper) chatWrapper.classList.remove('hidden-auth');
        if (btnHeaderLogin) {
            btnHeaderLogin.innerHTML = `<i class="fas fa-user"></i> Olá, ${emailLogado.split('@')[0]}`;
            btnHeaderLogin.href = 'perfil.html';
        }
    } else {
        if (chatWrapper) chatWrapper.classList.add('hidden-auth');
    }

    // 8. Eventos e Painel Admin
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('btn-logout');
    const searchBtn = document.getElementById('searchBtn');
    const saveBtn = document.getElementById('saveBtn');
    const updateBtn = document.getElementById('updateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const loginMsg = document.getElementById('loginMsg');

    async function handleAdminLogin(e) {
        if (e) e.preventDefault();
        const user = $('#loginUser')?.value.trim();
        const pass = $('#loginPass')?.value.trim();
        if (loginMsg) loginMsg.textContent = '';

        if (!user || !pass) {
            if (loginMsg) loginMsg.textContent = 'Informe usuário e senha';
            return;
        }

        const r = await adminLogin(user, pass);
        if (r.ok) {
            if (loginMsg) loginMsg.textContent = 'Login realizado com sucesso!';
            showAdminState(true);
            loadAdminRecipes();
        } else if (r.status === 401) {
            if (loginMsg) loginMsg.textContent = 'Credenciais inválidas';
        } else {
            if (loginMsg) loginMsg.textContent = r.message || 'Erro ao conectar com o servidor.';
        }
    }

    if (loginForm) loginForm.addEventListener('submit', handleAdminLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', adminLogout);
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const q = $('#searchInput')?.value.trim();
            loadAdminRecipes(q);
        });
    }
    if (saveBtn) saveBtn.addEventListener('click', submitNewRecipe);
    if (updateBtn) updateBtn.addEventListener('click', updateExistingRecipe);
    if (clearBtn) clearBtn.addEventListener('click', clearAdminForm);

    // Inicialização do estado Admin
    const token = getAdminToken();
    if (document.getElementById('recipeList')) {
        showAdminState(!!token);
        if (token) loadAdminRecipes();
    }

    // ---------- Novo Código para o Modal da AI ----------
    const openAiCardBtn = document.getElementById('openAiCardBtn');
    const aiAboutModal = document.getElementById('ai-about-modal');
    const closeAiModalBtn = document.getElementById('close-ai-modal-btn');

    function openAiAboutModal() {
        if (!aiAboutModal) return;
        aiAboutModal.classList.remove('hidden');
        aiAboutModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeAiAboutModal() {
        if (!aiAboutModal) return;
        aiAboutModal.classList.add('hidden');
        aiAboutModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (openAiCardBtn) {
        openAiCardBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openAiAboutModal();
        });
    }

    if (closeAiModalBtn) {
        closeAiModalBtn.addEventListener('click', closeAiAboutModal);
    }

    if (aiAboutModal) {
        aiAboutModal.addEventListener('click', (event) => {
            if (event.target === aiAboutModal) closeAiAboutModal();
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && aiAboutModal && !aiAboutModal.classList.contains('hidden')) {
            closeAiAboutModal();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('recipe-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const recipeGrid = document.getElementById('recipe-grid');

    // 1. Delegar o clique no container de receitas
    if (recipeGrid) {
        recipeGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.recipe-card');
            if (card) {
                const recipeId = card.dataset.id;
                if (recipeId) {
                    abrirModalReceita(recipeId);
                }
            }
        });
    }

    // 2. Fechar o Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', fecharModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });

    function fecharModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Reativa scroll da página
    }

    // 3. Buscar os dados do Banco de Dados via API e renderizar no Modal
    async function abrirModalReceita(id) {
        // Exibe feedback de carregamento
        modalContent.innerHTML = '<div style="padding:40px; text-align:center;">Carregando detalhes...</div>';
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Trava o scroll de fundo

        try {
            const response = await fetch(`${API}/recipes/${id}`);
            
            if (!response.ok) throw new Error('Erro ao carregar a receita');
            
            const receita = await response.json();
            renderizarDetalhesModal(receita);
        } catch (error) {
            console.error(error);
            modalContent.innerHTML = `
                <div style="padding:40px; text-align:center; color:#d9534f;">
                    <i class="fas fa-exclamation-circle fa-2x"></i>
                    <p style="margin-top:10px;">Não foi possível carregar esta receita no momento.</p>
                </div>`;
        }
    }

    // 4. Injetar as informações retornadas do Banco no HTML do Modal
    function renderizarDetalhesModal(receita) {
        const title = receita.title || receita.titulo || 'Sem título';
        const image = receita.image || receita.imagem || 'https://via.placeholder.com/1200x700';
        const category = receita.category || receita.categoria || 'Geral';
        const time = receita.time || receita.tempo || 'N/I';
        const difficulty = receita.difficulty || receita.dificuldade || 'N/I';
        const excerpt = receita.excerpt || receita.resumo || 'Sem descrição disponível.';

        const normalizeList = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
            return String(value)
                .split(/\n|;|\|/)
                .map(item => item.trim())
                .filter(Boolean);
        };

        const ingredients = normalizeList(receita.ingredients || receita.ingredientes);
        const steps = normalizeList(receita.steps || receita.passos);

        const ingredientHtml = ingredients.length
            ? ingredients.map(item => `<li>${escapeHtml(item)}</li>`).join('')
            : '<li>Sem ingredientes informados.</li>';

        const stepsHtml = steps.length
            ? steps.map(item => `<li>${escapeHtml(item)}</li>`).join('')
            : '<li>Sem instruções informadas.</li>';

        modalContent.innerHTML = `
            <img src="${image}" alt="${escapeHtml(title)}" class="modal-hero-img">
            <div class="modal-details-content">
                <div class="modal-badges">
                    <span class="modal-badge">${escapeHtml(category)}</span>
                    <span class="modal-badge light">${escapeHtml(time)}</span>
                    <span class="modal-badge light">${escapeHtml(difficulty)}</span>
                </div>

                <h2 class="modal-title">${escapeHtml(title)}</h2>

                <p class="modal-summary">
                    ${escapeHtml(excerpt)}
                </p>

                <div class="modal-two-col">
                    <div class="modal-panel">
                        <h4>Ingredientes</h4>
                        <ul class="modal-list">
                            ${ingredientHtml}
                        </ul>
                    </div>

                    <div class="modal-panel">
                        <h4>Modo de preparo</h4>
                        <ol class="modal-list">
                            ${stepsHtml}
                        </ol>
                    </div>
                </div>
            </div>
        `;
    }
});
