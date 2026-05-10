const express = require('express');
const pool = require('../db'); // Verifique se o caminho do db está correto
const multer = require("multer");
const path = require("path");
const fs = require("fs"); 
const router = express.Router();

// 🔹 Configuração do Multer nível Sênior
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirUploads = path.join(__dirname, '..', 'uploads', 'usuarios');
        if (!fs.existsSync(dirUploads)) {
            fs.mkdirSync(dirUploads, { recursive: true });
            console.log("Pasta criada com sucesso:", dirUploads);
        }
        cb(null, dirUploads);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// LISTAR TODOS (GET) - 🔴 BLINDADO: SENHA REMOVIDA DO SELECT
router.get("/", async (req, res) => {
    try {
        // Trocamos o SELECT * pelos campos exatos. A senha NÃO vai mais para a web!
        const result = await pool.query("SELECT codusuario, nome, email, numero, perfil, foto_perfil FROM usuarios ORDER BY codusuario DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// BUSCAR UM (GET) - 🔴 BLINDADO: SENHA REMOVIDA DO SELECT
router.get("/:codusuario", async (req, res) => {
    try {
        const { codusuario } = req.params;
        const result = await pool.query("SELECT codusuario, nome, email, numero, perfil, foto_perfil FROM usuarios WHERE codusuario=$1", [codusuario]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar" });
    }
});

// CRIAR USUÁRIO (POST)
router.post("/", upload.single("foto"), async (req, res) => {
    try {
        const { nome, email, numero, senha, perfil } = req.body;
        
        let fotoFinal = null;
        if (req.file) {
            fotoFinal = "/uploads/usuarios/" + req.file.filename;
        }

        // Blindado: O RETURNING não devolve mais a senha após criar a conta
        const result = await pool.query(
            `INSERT INTO usuarios (nome, email, numero, senha, perfil, foto_perfil) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING codusuario, nome, email, numero, perfil, foto_perfil`,
            [nome, email, numero, senha, perfil, fotoFinal]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("ERRO NO POST:", err);
        if (err.code === '23505') {
            return res.status(400).json({ erro: "Este e-mail já está cadastrado!" });
        }
        res.status(500).json({ erro: "Erro interno: " + err.message });
    }
});

// ATUALIZAR (PUT)
router.put("/:codusuario", upload.single("foto"), async (req, res) => {
    try {
        const { codusuario } = req.params;
        const { nome, email, numero, senha, perfil } = req.body;

        const usuarioAtual = await pool.query("SELECT foto_perfil FROM usuarios WHERE codusuario=$1", [codusuario]);
        
        if (usuarioAtual.rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        let fotoFinal = usuarioAtual.rows[0].foto_perfil;
        if (req.file) {
            fotoFinal = "/uploads/usuarios/" + req.file.filename;
        }

        // Blindado: O RETURNING não devolve mais a senha após atualizar
        const result = await pool.query(
            `UPDATE usuarios 
             SET nome=$1, email=$2, numero=$3, senha=$4, perfil=$5, foto_perfil=$6
             WHERE codusuario=$7 
             RETURNING codusuario, nome, email, numero, perfil, foto_perfil`,
            [nome, email, numero, senha, perfil, fotoFinal, codusuario]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("ERRO DETALHADO NO PUT:", err);
        res.status(500).json({ erro: "Erro interno: " + err.message });
    }
});

// DELETE
router.delete("/:codusuario", async (req, res) => {
    try {
        const { codusuario } = req.params;
        await pool.query("DELETE FROM usuarios WHERE codusuario=$1", [codusuario]);
        res.json({ message: "Deletado" });
    } catch (err) {
        if (err.code === '23503') {
            res.status(400).json({ erro: "Este usuário tem vendas e não pode ser excluído." });
        } else {
            res.status(500).json({ erro: err.message });
        }
    }
});

module.exports = router;
