const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

router.post("/", async (req, res) => {
  try {
    const { nome, email, numero, senha, codusuario } = req.body;
    if (!nome || !email || !numero || !senha || !codusuario) return res.status(400).json({ error: "Campos obrigatórios: nome, email, numero, senha e codusuario" });

    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, numero, senha, codusuario) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, email, numero, senha, codusuario]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao inserir usuario" });
  }
});

router.delete("/:codusuario", async (req, res) => {
  try {
    const { codusuario } = req.params;
    const result = await pool.query("DELETE FROM usuarios WHERE codusuario = $1 RETURNING *", [codusuario]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json({ message: "Usuário deletado com sucesso", usuario: result.rows[0] });
  }
    catch (err) {
    res.status(500).json({ error: "Erro ao deletar usuário" });
    }
});


module.exports = router;