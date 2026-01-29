//ler a chave secreta do arquivo .env
const api_key = process.env.API_KEY_SECRET

let contador = 0


function autenticarAPIkey(req, res, next) {

    const api_key_front = req.header('minha-chave');
    if (api_key_front === api_key) {
        console.log("Acesso autorizado", api_key_front, api_key);
        contador = contador + 1;
        console.log("contador de acessos:", contador);
        next();
    }
    else {
        console.log("Acesso negado", api_key_front, api_key);
        return res.status(500).json({ menssagem: "Acesso negado! Chave inválida." });
    }
}

//contador de repetiçoes depois de 3 nao pode mais acessar

module.exports = autenticarAPIkey;