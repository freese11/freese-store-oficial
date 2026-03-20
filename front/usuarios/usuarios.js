const URL_SERVIDOR = "https://projeto-programador-freese-backend.onrender.com";
const API = `${URL_SERVIDOR}/usuarios`;
const API_KEY = "SUA_CHAVE_SECRETA_MUITO_FORTE_123456";

// 👇 Imagem de segurança ultra-forte embutida (Impossível de falhar ou ser apagada)
const IMG_FALHA_USUARIO = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

let todosUsuarios = [];
let abaAtiva = "cliente"; 

function voltar() {
    window.location.href = "/admin/admin.html";
}

async function carregar() {
    try {
        const res = await fetch(API, { headers: { "minha-chave": API_KEY } });
        todosUsuarios = await res.json();
        filtrar(); 
    } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);
    }
}

function mudarAba(tipoPerfil) {
    abaAtiva = tipoPerfil;
    
    document.getElementById("aba-clientes").classList.remove("ativo");
    document.getElementById("aba-adms").classList.remove("ativo");
    
    if (tipoPerfil === "cliente") {
        document.getElementById("aba-clientes").classList.add("ativo");
    } else {
        document.getElementById("aba-adms").classList.add("ativo");
    }
    
    filtrar();
}

function filtrar() {
    const texto = document.getElementById("filtro-nome").value.toLowerCase();

    const filtrados = todosUsuarios.filter(u => {
        const perfilUser = (u.perfil || "cliente").toLowerCase();
        
        const bateuAba = (perfilUser === abaAtiva);
        const bateuTexto = (u.nome && u.nome.toLowerCase().includes(texto)) || 
                           (u.email && u.email.toLowerCase().includes(texto));

        return bateuAba && bateuTexto;
    });

    renderizar(filtrados);
}

function renderizar(lista) {
    const tabela = document.getElementById("tabela-usuarios");
    tabela.innerHTML = "";

    lista.forEach(u => {
        const id = u.codusuario;
        const ehAdm = (u.perfil && u.perfil.toLowerCase() === 'adm');
        const tipoClasse = ehAdm ? 'badge-adm' : 'badge-cliente';
        const tipoTexto = ehAdm ? 'Administrador' : 'Cliente';
        
        // 👇 MÁGICA DA FOTO COM PROTEÇÃO 👇
        let urlFoto = IMG_FALHA_USUARIO; // Começa com a foto padrão segura
        
        if (u.foto_perfil) {
            if (u.foto_perfil.startsWith('http')) {
                urlFoto = u.foto_perfil;
            } else {
                // Garante que a barra (/) não seja duplicada nem esquecida
                urlFoto = URL_SERVIDOR + (u.foto_perfil.startsWith('/') ? u.foto_perfil : '/' + u.foto_perfil);
            }
        }

        // Note o onerror na tag img: se o Render apagou, ele mostra o SVG padrão!
        tabela.innerHTML += `
            <tr>
                <td>
                    <img src="${urlFoto}" 
                         onerror="this.onerror=null; this.src='${IMG_FALHA_USUARIO}';" 
                         class="avatar-tabela" 
                         alt="Foto"
                         style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; background-color: #fff; border: 1px solid #ddd;">
                </td>
                <td>#${id}</td>
                <td><strong>${u.nome}</strong></td>
                <td>${u.email}</td>
                <td>${u.numero || '-'}</td>
                <td><span class="${tipoClasse}">${tipoTexto}</span></td>
                <td>
                    <button class="editar" onclick="editar(${id})">Editar</button>
                    <button class="deletar" onclick="deletar(${id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function abrirModal(ehEdicao = false) {
    document.getElementById("modal").style.display = "block";
    document.getElementById("modal-titulo").innerText = ehEdicao ? "Editar Usuário" : "Novo Usuário";
    
    if(!ehEdicao) {
        document.getElementById("codusuario").value = "";
        document.getElementById("nome").value = "";
        document.getElementById("email").value = "";
        document.getElementById("senha").value = "";
        document.getElementById("numero").value = "";
        document.getElementById("perfil").value = abaAtiva; 
        document.getElementById("foto").value = "";
        
        // Aplica o escudo na foto de preview do modal
        const imgPreview = document.getElementById("preview-foto");
        imgPreview.src = IMG_FALHA_USUARIO;
        imgPreview.onerror = function() { this.onerror=null; this.src=IMG_FALHA_USUARIO; };
    }
}

function fecharModal() {
    document.getElementById("modal").style.display = "none";
}

function previewImagem(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("preview-foto").src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

async function salvar() {
    const cod = document.getElementById("codusuario").value;
    
    const formData = new FormData();
    formData.append("nome", document.getElementById("nome").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("senha", document.getElementById("senha").value);
    formData.append("numero", document.getElementById("numero").value);
    formData.append("perfil", document.getElementById("perfil").value);

    const inputFoto = document.getElementById("foto");
    if (inputFoto.files.length > 0) {
        formData.append("foto", inputFoto.files[0]);
    }

    const metodo = cod ? "PUT" : "POST";
    const url = cod ? `${API}/${cod}` : API;

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: {
                "minha-chave": API_KEY
            },
            body: formData
        });

        if(res.ok) {
            fecharModal();
            carregar(); 
        } else {
            const erro = await res.json();
            alert("Erro: " + (erro.erro || "Falha ao salvar."));
        }
    } catch(erro) {
        alert("Erro de conexão com o servidor.");
    }
}

async function editar(id) {
    try {
        const res = await fetch(`${API}/${id}`, { headers: { "minha-chave": API_KEY } });
        const u = await res.json();

        document.getElementById("codusuario").value = u.codusuario;
        document.getElementById("nome").value = u.nome;
        document.getElementById("email").value = u.email;
        document.getElementById("senha").value = u.senha || ""; 
        document.getElementById("numero").value = u.numero || "";
        document.getElementById("perfil").value = u.perfil || "cliente";
        
        // 👇 ARRUMAMOS O PREVIEW DA FOTO AQUI TAMBÉM 👇
        let urlFotoModal = IMG_FALHA_USUARIO;
        if (u.foto_perfil) {
            if (u.foto_perfil.startsWith('http')) {
                urlFotoModal = u.foto_perfil;
            } else {
                urlFotoModal = URL_SERVIDOR + (u.foto_perfil.startsWith('/') ? u.foto_perfil : '/' + u.foto_perfil);
            }
        }
        
        document.getElementById("foto").value = "";
        
        const imgPreview = document.getElementById("preview-foto");
        imgPreview.src = urlFotoModal;
        imgPreview.onerror = function() { this.onerror=null; this.src=IMG_FALHA_USUARIO; };

        abrirModal(true); 
    } catch(erro) {
        alert("Erro ao buscar os dados deste usuário.");
    }
}

async function deletar(id) {
    if (!confirm("Tem certeza que deseja excluir este usuário definitivamente?")) return;

    try {
        const res = await fetch(`${API}/${id}`, {
            method: "DELETE",
            headers: { "minha-chave": API_KEY }
        });

        if (res.ok) {
            carregar(); 
        } else {
            const dadosErro = await res.json();
            alert("Erro: " + dadosErro.erro); 
        }
    } catch(erro) {
        alert("Erro ao excluir o usuário.");
    }
}

carregar();
