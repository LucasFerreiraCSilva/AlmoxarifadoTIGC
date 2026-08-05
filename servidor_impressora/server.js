const http   = require('http');
const net    = require('net');

const IMPRESSORA_IP   = '10.201.114.50';
const IMPRESSORA_PORT = 9100;
const SERVIDOR_PORT   = 3000;

function enviarParaImpressora(dados) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.setTimeout(5000);

    client.connect(IMPRESSORA_PORT, IMPRESSORA_IP, () => {
      client.write(dados);
      client.end();
    });

    client.on('close', () => resolve());
    client.on('timeout', () => {
      client.destroy();
      reject(new Error('Timeout: impressora não respondeu'));
    });
    client.on('error', (err) => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  // CORS — permite requisições do GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/imprimir') {
    const chunks = [];

    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      const dados = Buffer.concat(chunks);
      try {
        await enviarParaImpressora(dados);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        console.log(`[${new Date().toLocaleString('pt-BR')}] Cupom impresso com sucesso`);
      } catch (e) {
        console.error(`[${new Date().toLocaleString('pt-BR')}] Erro:`, e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Health check — para testar se o servidor está no ar
  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'online', impressora: `${IMPRESSORA_IP}:${IMPRESSORA_PORT}` }));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(SERVIDOR_PORT, () => {
  console.log('='.repeat(45));
  console.log(' Servidor de Impressão — Almoxarifado TI');
  console.log('='.repeat(45));
  console.log(` Rodando em:  http://localhost:${SERVIDOR_PORT}`);
  console.log(` Impressora:  ${IMPRESSORA_IP}:${IMPRESSORA_PORT}`);
  console.log(` Status:      http://localhost:${SERVIDOR_PORT}/status`);
  console.log('='.repeat(45));
});