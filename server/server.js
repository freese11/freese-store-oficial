const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ==========================================
// IMPORTAÇÃO DAS ROTAS DO BANCO DE DADOS
// ==========================================
const produtosRouter = require('./routes/produtosDB');
const usuariosRouter = require('./routes/usuariosDB');
const vendasRouter = require('./routes/vendasDB');
// Retirei o loginDB daqui, pois o seu login deve estar junto com usuariosDB!

// ==========================================
// CONFIGURAÇÕES BÁSICAS
// ==========================================
app.use(cors());
app.use(express.json());

// Permite que as imagens enviadas (fotos de perfil/produtos) fiquem acessíveis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// SISTEMA DE SEGURANÇA (O "SEGURANÇA DA PORTA")
// ==========================================
const API_KEY = "LUCAS_FREESE_SENHAZINHA111";

function autenticarAPIkey(req, res, next) {
    const chaveFornecida = req.headers['minha-chave'];
    if (chaveFornecida === API_KEY) {
        return next(); // Deixa passar! A chave está certa.
    }
    // Se não tem chave ou está errada, barra o acesso.
    return res.status(401).json({ erro: 'Acesso negado. Ação exclusiva para administradores.' });
}

// ==========================================
// 1. ÁREA PÚBLICA (Não precisa de chave)
// ==========================================
app.use('/usuarios', usuariosRouter); // Criar conta, buscar perfil, login e trocar foto

// ==========================================
// 2. CATÁLOGO DE PRODUTOS
// ==========================================
app.use('/produtos', (req, res, next) => {
    // GET: Qualquer cliente pode ver os produtos
    if (req.method === 'GET') return next(); 
    
    // POST, PUT, DELETE: Só o Admin pode adicionar, editar ou apagar roupas
    return autenticarAPIkey(req, res, next); 
}, produtosRouter);

// ==========================================
// 3. VENDAS E PEDIDOS
// ==========================================
app.use('/vendas', (req, res, next) => {
    // POST: Qualquer cliente pode finalizar uma compra (checkout)
    if (req.method === 'POST') return next(); 
    
    // GET para /meus-pedidos: O cliente pode ver o SEU PRÓPRIO histórico
    if (req.method === 'GET' && req.path.startsWith('/meus-pedidos')) return next(); 
    
    // GET (ver todas as vendas do site), PUT (mudar status para Enviado/Cancelado) e DELETE
    // Só o Administrador pode fazer isso:
    return autenticarAPIkey(req, res, next); 
}, vendasRouter);

// ==========================================
// INICIANDO O SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor Freese Store rodando perfeitamente na porta ${PORT}`);
});
