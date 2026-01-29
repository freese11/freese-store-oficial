const express = require('express');
const pool = require('../db'); 

const router = express.Router();




router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM produtos');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

router.post("/", async (req, res) => {
  try {
    const { nome, marca, valor, estoque, tipo, cor, ativoInativo, tamanho } = req.body;
    if (!nome || !marca || !valor || !estoque || !tipo || !cor || !ativoInativo || !tamanho) return res.status(400).json({ error: "Campos obrigatórios: nome, marca, valor, estoque, tipo, cor, ativoInativo e tamanho" });

    const result = await pool.query(
      "INSERT INTO produtos (nome, marca, valor, estoque, tipo, cor, ativoInativo, tamanho) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [nome, marca, valor, estoque, tipo, cor, ativoInativo,tamanho]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao inserir produto" });
  }
});


/*router.post('/', async (req, res) => {
    console.log("Chegou no post de produtos");
    console.log(req)
    try {

        const { nome , marca , valor, estoque , tipo ,cor ,ativoInativo ,tamanho } = req.body;
if (!nome || !marca || !valor || !estoque || !tipo || !cor || !ativoInativo || !tamanho) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        const result = await pool.query(
            'INSERT INTO produtos (nome, marca, valor, estoque, tipo, cor, ativoInativo, tamanho) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [nome, marca, valor, estoque, tipo, cor, ativoInativo, tamanho]
        );
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor',err.message);
    }
});
*/

module.exports = router;