const express = require("express");
require("dotenv").config();

const cors = require("cors");

const clientesDB = require("./routes/clientesDB");
const produtosDB = require("./routes/produtosDB");
const usuariosDB = require("./routes/usuariosDB");
const vendasDB = require("./routes/vendasDB");

const autenticarAPIkey =  require("./autorizar")

const app = express();
app.use(cors());
app.use(express.json());

//rotas principais

//app.use(autenticarAPIkey);

//app.use("/clientes", clientesDB);
app.use("/produtos", produtosDB);
//app.use("/usuarios", usuariosDB);
//app.use("/vendas", vendasDB);

// rota raiz 
app.get("/", (req, res) => {
  res.send("Bem-vindo à API de E-commerce!");
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
