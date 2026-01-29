const swaggerJsDoc = require("swagger-jsdoc");

// Configuração do Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description:
        "API construída para gerenciar dados de uma loja online.",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./routes/*.js"], // Caminho para os comentários JSDoc das rotas
};

// Gerar a especificação
const swaggerSpec = swaggerJsDoc(options);

// Exportar para o server.js usar
module.exports = swaggerSpec;
