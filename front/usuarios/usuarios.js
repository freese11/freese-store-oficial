const API = "http://localhost:3000/usuarios";
const API_KEY = "SUA_CHAVE_SECRETA_MUITO_FORTE_123456";

async function carregar() {
    try {
        const res = await fetch(API, { headers: { "minha-chave": API_KEY } });
        const usuarios = await res.json();
        renderizar(usuarios);
    } catch (err) {
        console.error("Erro ao carregar lista", err);
    }
}

function renderizar(lista) {
    const tabela = document.getElementById("tabela-usuarios");
    tabela.innerHTML = "";
    lista.forEach(u => {
        // Se foto_perfil não existir, usa uma imagem local ou fallback vazio
        const fotoPath = u.foto_perfil ? `http://localhost:3000${u.foto_perfil}` : 'https://placehold.co/50';
        
        tabela.innerHTML += `
            <tr>
                <td><img src="${fotoPath}" width="50" height="50" style="object-fit: cover; border-radius: 50%;"></td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.numero}</td>
                <td>${u.perfil}</td>
                <td>
                    <button onclick="editar(${u.codusuario})">Editar</button>
                    <button onclick="deletar(${u.codusuario})">Excluir</button>
                </td>
            </tr>`;
    });
}

async function salvar() {
    const cod = document.getElementById("codusuario").value;
    const formData = new FormData();
    
    formData.append("nome", document.getElementById("nome").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("numero", document.getElementById("numero").value);
    formData.append("senha", document.getElementById("senha").value);
    formData.append("perfil", document.getElementById("perfil").value);

    const fotoInput = document.getElementById("foto");
    if (fotoInput.files[0]) {
        formData.append("foto", fotoInput.files[0]);
    }

    const metodo = cod ? "PUT" : "POST";
    const url = cod ? `${API}/${cod}` : API;

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { "minha-chave": API_KEY },
            body: formData
        });

        const resultado = await res.json();

        if (res.ok) {
            fecharModal();
            carregar();
        } else {
            alert("Erro: " + resultado.erro);
        }
    } catch (err) {
        alert("Erro na conexão com o servidor.");
    }
}

async function editar(id) {
    const res = await fetch(`${API}/${id}`, { headers: { "minha-chave": API_KEY } });
    const u = await res.json();

    document.getElementById("codusuario").value = u.codusuario;
    document.getElementById("nome").value = u.nome;
    document.getElementById("email").value = u.email;
    document.getElementById("numero").value = u.numero;
    document.getElementById("senha").value = u.senha;
    document.getElementById("perfil").value = u.perfil;

    const preview = document.getElementById("preview");
    if (u.foto_perfil) {
        preview.src = "http://localhost:3000" + u.foto_perfil;
        preview.style.display = "block";
    }
    document.getElementById("modal").style.display = "block";
}

// ... manter funções deletar, abrirModal e fecharModal anteriores