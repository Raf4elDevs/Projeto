const API = "http://localhost:8080";
const CLOUD_NAME = "ptoaofvd"; // cloud name
const UPLOAD_PRESET = "preset_biteByte"; //

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.location.port === '3000' ? 'http://localhost:3000/api' : 'http://localhost:8080';

    // 1. Redirecionamento da Logo
    const logoPerfil = document.getElementById('logo-perfil');
    if (logoPerfil) {
        logoPerfil.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }


    //========================================
    // CONFIGURAÇÕES DO CLOUDINARY
    //========================================
const CLOUD_NAME = "ptoaofvd";
const UPLOAD_PRESET = "preset_biteByte";

// ELEMENTOS DO DOM
const editFoto = document.getElementById("editFoto");
const editFoto_preview = document.getElementById("editFoto_preview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const btnRemoveImage = document.getElementById("btnRemoveImage");
const btnUploadCloudinary = document.getElementById("btnUploadCloudinary");

// FUNÇÃO AUXILIAR PARA EXIBIR/OCULTAR A PRÉVIA DA FOTO DE PERFIL
function setProfileImage(url) {
  if (url && url.trim() !== "") {
    editFoto.value = url;
    editFoto_preview.src = url;
    imagePreviewContainer.style.display = "block"; // Exibe o container com a imagem e o botão X
  } else {
    editFoto.value = "";
    editFoto_preview.src = "";
    imagePreviewContainer.style.display = "none"; // Esconde o container
  }
}

// INICIALIZAÇÃO DO WIDGET DO CLOUDINARY
const profileWidget = cloudinary.createUploadWidget({
    cloudName: CLOUD_NAME, 
    uploadPreset: UPLOAD_PRESET,
    folder: "fotos_perfil", // 👈 O Cloudinary salvará nesta pasta!
    sources: ['local', 'url', 'camera'],
    multiple: false,
    styles: {
      palette: {
        window: "#FFFFFF",             
        windowBorder: "#222222",       
        tabIcon: "#ff751f",            // Laranja BiteByte
        menuIcons: "#222222",          
        textDark: "#222222",           
        textLight: "#FFFFFF",          
        link: "#ff751f",               
        action: "#ff751f",             
        inactiveTabIcon: "#666666",    
        error: "#e74c3c",              
        inProgress: "#ff751f",         
        complete: "#20B832",          
        sourceBg: "#f9f9f9"            
      }
    }
  }, (error, result) => {
    if (!error && result && result.event === "success") {
      setProfileImage(result.info.secure_url);
    }
});

// ABRIR WIDGET AO CLICAR NO BOTÃO
if (btnUploadCloudinary) {
  btnUploadCloudinary.addEventListener("click", () => {
    profileWidget.open();
  });
}

// APAGAR FOTO AO CLICAR NO "X"
if (btnRemoveImage) {
  btnRemoveImage.addEventListener("click", () => {
    setProfileImage("");
  });
}

// AO ABRIR O MODAL DE EDIÇÃO DO PERFIL:
// (Chame essa função preenchendo a foto atual do usuário para carregar a prévia)
document.getElementById("openEditProfile")?.addEventListener("click", () => {
  // Exemplo: se o usuário já tem uma foto no banco, passe ela aqui
  const fotoAtual = document.getElementById("profileImage")?.src || "";
  if (fotoAtual && !fotoAtual.includes("default-profile.svg")) {
    setProfileImage(fotoAtual);
  } else {
    setProfileImage("");
  }
});
    //========================================




    // Elements
    const emailLogado = localStorage.getItem('usuarioLogado');
    const profileNameEl = document.getElementById('profileName');
    const profileEmailEl = document.getElementById('profileEmail');
    const profileBioEl = document.getElementById('profileBio');
    const profileDietEl = document.getElementById('profileDiet');
    const DEFAULT_PROFILE_IMAGE = 'assets/default-profile.svg';

    if (!profileNameEl || !profileEmailEl || !profileBioEl) return;

    function normalizeLabel(key) {
        const map = {
            'sem-gluten': 'Sem glúten',
            'sem-lactose': 'Sem lactose',
            'amendoim': 'Amendoim/castanhas',
            'vegana': 'Vegana',
            'vegetariana': 'Vegetariana'
        };
        return map[key] || key;
    }

    // 2. Carregar Dados do Perfil
    async function loadProfile() {
        if (!emailLogado) {
            profileNameEl.textContent = 'Visitante';
            profileEmailEl.textContent = 'Faça login para gerenciar seu perfil';
            if (profileDietEl) profileDietEl.innerHTML = '<li>Faça login para ver suas restrições</li>';
            setProfileImage(DEFAULT_PROFILE_IMAGE);
            return;
        }

        profileEmailEl.textContent = emailLogado;
        profileNameEl.textContent = emailLogado.split('@')[0];

        try {
            const res = await fetch(`${API_BASE}/user/profile?email=${encodeURIComponent(emailLogado)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.nome) profileNameEl.textContent = data.nome;
                if (data.bio) profileBioEl.textContent = data.bio;
                if (data.habilidade) localStorage.setItem('usuarioHabilidade', data.habilidade);

                renderRestricoes(data.restricoes);
                if (data.foto) {
                    setProfileImage(data.foto);
                    localStorage.setItem('usuarioFoto', data.foto);
                } else {
                    setProfileImage(DEFAULT_PROFILE_IMAGE);
                    localStorage.setItem('usuarioFoto', DEFAULT_PROFILE_IMAGE);
                }
            } else {
                throw new Error('Falha no servidor');
            }
        } catch (e) {
            const localBio = localStorage.getItem('usuarioBio');
            if (localBio) profileBioEl.textContent = localBio;

            const restricoes = JSON.parse(localStorage.getItem('usuarioRestricoes') || '[]');
            renderRestricoes(restricoes);

            const localFoto = localStorage.getItem('usuarioFoto');
            if (localFoto) {
                setProfileImage(localFoto);
            } else {
                setProfileImage(DEFAULT_PROFILE_IMAGE);
            }
        }
    }

    function renderRestricoes(restricoesArray) {
        if (!profileDietEl) return;
        profileDietEl.innerHTML = '';

        if (restricoesArray && restricoesArray.length > 0) {
            restricoesArray.forEach(r => {
                const li = document.createElement('li');
                li.textContent = normalizeLabel(r);
                profileDietEl.appendChild(li);
            });
        } else {
            profileDietEl.innerHTML = '<li>Nenhuma restrição definida</li>';
        }
    }

    // 3. Modal de Edição
    const editBtn = document.getElementById('openEditProfile');
    const editModal = document.getElementById('editModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const editForm = document.getElementById('editProfileForm');

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (!emailLogado) {
                window.location.href = 'cadastro.html';
                return;
            }

            const editNome = document.getElementById('editNome');
            const editBio = document.getElementById('editBio');
            const editFoto = document.getElementById('editFoto');
            const editHabilidade = document.getElementById('editHabilidade');

            if (editNome) editNome.value = profileNameEl.textContent;
            if (editBio) editBio.value = profileBioEl.textContent;

            const currentImg = document.getElementById('profileImage');
            if (editFoto && currentImg) {
                editFoto.value = currentImg.src.includes('placeholder') ? '' : currentImg.src;
            }

            if (editHabilidade) {
                editHabilidade.value = localStorage.getItem('usuarioHabilidade') || 'iniciante';
            }

            const storedRestricoes = JSON.parse(localStorage.getItem('usuarioRestricoes') || '[]');
            Array.from(document.querySelectorAll('#editRestricoes input')).forEach(inp => {
                inp.checked = storedRestricoes.includes(inp.value);
            });

            if (editModal) editModal.style.display = 'flex';
        });
    }

    if (cancelEdit) {
        cancelEdit.addEventListener('click', () => {
            if (editModal) editModal.style.display = 'none';
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('editNome').value.trim();
            const bio = document.getElementById('editBio').value.trim();
            const foto = document.getElementById('editFoto').value.trim();
            const habilidade = document.getElementById('editHabilidade').value;
            const restricoes = Array.from(document.querySelectorAll('#editRestricoes input:checked')).map(i => i.value);

            // Atualização no DOM
            if (nome) profileNameEl.textContent = nome;
            if (bio) profileBioEl.textContent = bio;

            // Atualização do LocalStorage
            localStorage.setItem('usuarioBio', bio);
            localStorage.setItem('usuarioHabilidade', habilidade);
            localStorage.setItem('usuarioRestricoes', JSON.stringify(restricoes));

            if (foto) {
                setProfileImage(foto);
                localStorage.setItem('usuarioFoto', foto);
            }

            renderRestricoes(restricoes);

            // Envio ao servidor
            const token = localStorage.getItem('token');
            fetch(`${API_BASE}/user/preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ email: emailLogado, nome, bio, foto, habilidade, restricoes })
            }).catch(() => {});

            if (editModal) editModal.style.display = 'none';
        });
    }

    // 4. Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            const keys = ['usuarioLogado', 'usuarioRestricoes', 'usuarioHabilidade', 'usuarioBio', 'usuarioFoto', 'token'];
            keys.forEach(k => localStorage.removeItem(k));
            window.location.href = 'index.html';
        });
    }

    // 5. Manipulação da Imagem de Perfil
    function setProfileImage(src) {
        const img = document.getElementById('profileImage');
        const fallback = document.getElementById('profileFallback');
        if (!img) return;

        const actualSrc = src || DEFAULT_PROFILE_IMAGE;
        img.style.display = 'block';
        if (fallback) fallback.style.display = 'none';

        img.onerror = function () {
            img.style.display = 'none';
            if (fallback) {
                const name = (document.getElementById('profileName') || { textContent: '' }).textContent || '';
                const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
                fallback.textContent = initials || 'U';
                fallback.style.display = 'flex';
            }
        };

        img.src = actualSrc;
    }

    setProfileImage(DEFAULT_PROFILE_IMAGE);
    loadProfile();
});