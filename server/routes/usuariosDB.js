const express = require('express');
const pool = require('../db');
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Configuração do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/usuarios"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// LISTAR
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM usuarios ORDER BY codusuario DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// BUSCAR UM
router.get("/:codusuario", async (req, res) => {
    try {
        const { codusuario } = req.params;
        const result = await pool.query("SELECT * FROM usuarios WHERE codusuario=$1", [codusuario]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar" });
    }
});

// ATUALIZAR (PUT) - CORRIGIDO
router.put("/:codusuario", upload.single("foto"), async (req, res) => {
    try {
        const { codusuario } = req.params;
        const { nome, email, numero, senha, perfil } = req.body;

        // 1. Busca a foto atual para não apagar se não enviar nova
        const usuarioAtual = await pool.query("SELECT foto_perfil FROM usuarios WHERE codusuario=$1", [codusuario]);
        
        if (usuarioAtual.rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        let fotoFinal = usuarioAtual.rows[0].foto_perfil;

        // 2. Se enviou uma foto nova, atualiza o caminho
        if (req.file) {
            fotoFinal = "/uploads/usuarios/" + req.file.filename;
        }

        // 3. SQL usando EXATAMENTE o nome da sua coluna: foto_perfil
        const result = await pool.query(
            `UPDATE usuarios 
             SET nome=$1, email=$2, numero=$3, senha=$4, perfil=$5, foto_perfil=$6
             WHERE codusuario=$7 RETURNING *`,
            [nome, email, numero, senha, perfil, fotoFinal, codusuario]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("ERRO DETALHADO NO PUT:", err); // Isso aparecerá no seu terminal
        res.status(500).json({ erro: "Erro interno: " + err.message });
    }
});

// DELETE (com tratamento de erro de chave estrangeira)
router.delete("/:codusuario", async (req, res) => {
    try {
        const { codusuario } = req.params;
        await pool.query("DELETE FROM usuarios WHERE codusuario=$1", [codusuario]);
        res.json({ message: "Deletado" });
    } catch (err) {
        if (err.code === '23503') {
            res.status(500).json({ erro: "Este usuário tem vendas e não pode ser excluído." });
        } else {
            res.status(500).json({ erro: err.message });
        }
    }
});

module.exports = router;