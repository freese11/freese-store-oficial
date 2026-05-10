const express = require("express");
require("dotenv").config();
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const produtosRouter = require("./routes/produtosDB");
const autenticarAPIkey = require("./autorizar");
const clientesRouter = require("./routes/clientesDB");
const usuariosRouter = require("./routes/usuariosDB");
const vendasRouter = require("./routes/vendasDB");

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. ÁREA PÚBLICA (Não precisa de API Key)
// ==========================================

// 🔹 Liberar acesso aos arquivos do site (HTML, CSS, JS, Imagens)
app.use('/front', express.static(path.join(__dirname, 'front')));

// 🔹 Liberar acesso às imagens de produtos e fotos de perfil enviadas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔹 Rota raiz
app.get("/", (req, res) => {
  res.send("🌎 API da Freese Store rodando!");
});

// 🔹 Catálogo de Produtos (Apenas Visualização. Para deletar, vai pedir a chave)
app.use("/produtos", (req, res, next) => {
    if (req.method === 'GET') return next(); 
    return autenticarAPIkey(req, res, next); 
}, produtosRouter);

// 🔹 Vendas / Checkout (Permite POST para o cliente comprar, exige chave para o resto)
app.use("/vendas", (req, res, next) => {
    if (req.method === 'POST') return next(); 
    return autenticarAPIkey(req, res, next); 
}, vendasRouter);

// 🔹 Usuários (Para os clientes criarem conta e logarem normalmente)
app.use("/usuarios", usuariosRouter);

// 🔹 Rota de Login Unificada (Pública, para permitir que entrem)
app.post("/login", async (req, res) => {
    const { email, senha, tipoLoginEscolhido } = req.body;

    try {
        let result;
        console.log("TIPO DE LOGIN SOLICITADO:", tipoLoginEscolhido);

        if (tipoLoginEscolhido === 'admin') {
            result = await pool.query(
                'SELECT * FROM usuarios WHERE email = $1 AND senha = $2 AND perfil = $3',
                [email, senha, 'adm']
            );
        } else {
            result = await pool.query(
                'SELECT * FROM usuarios WHERE email = $1 AND senha = $2 AND perfil = $3',
                [email, senha, 'cliente']
            );
        }

        if (result.rows.length > 0) {
            const user = result.rows[0];
            
            res.json({
                sucesso: true,
                codusuario: user.codusuario, 
                nome: user.nome,
                email: user.email,
                tipo: user.perfil,
                foto_perfil: user.foto_perfil 
            });
        } else {
            res.status(401).json({
                sucesso: false,
                message: "E-mail ou senha incorretos"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// ==========================================
// 2. PORTA DE SEGURANÇA (Middlewares)
// ==========================================
// 🔴 A PARTIR DESTA LINHA, TUDO EXIGE A API KEY!
app.use(autenticarAPIkey);

// ==========================================
// 3. ÁREA RESTRITA (Requer API Key)
// ==========================================
app.use("/clientes", clientesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
