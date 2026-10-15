import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import 'dotenv/config';

const PORT = Number(process.env.PORT || 8787);
const API_KEY = process.env.NABR_API_KEY;
if (!API_KEY) {
  console.error('Missing NABR_API_KEY. Copy .env.example to .env and set your private key.');
  process.exit(1);
}
const server = http.createServer((req, res) => {
  if (req.url === '/health') { res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify({ok:true, service:'nabr-websocket-proxy'})); return; }
  res.writeHead(404); res.end('Not found');
});
const wss = new WebSocketServer({ noServer: true, maxPayload: 2 * 1024 * 1024 });
server.on('upgrade', (req, socket, head) => {
  if (req.url !== '/nabr') { socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, client => wss.emit('connection', client, req));
});
wss.on('connection', (client) => {
  const upstream = new WebSocket(`wss://api.qurani.ai?api_key=${encodeURIComponent(API_KEY)}`);
  upstream.binaryType = 'nodebuffer';
  // The browser may send START immediately after its local socket opens. Queue
  // those messages until the authenticated upstream WebSocket is actually ready.
  const pending = [];
  client.on('message', (data, isBinary) => {
    if (upstream.readyState === WebSocket.OPEN) upstream.send(data, { binary: isBinary });
    else if (upstream.readyState === WebSocket.CONNECTING && pending.length < 80) pending.push({ data, isBinary });
  });
  upstream.on('message', (data, isBinary) => {
    if (client.readyState === WebSocket.OPEN) client.send(data, { binary: isBinary });
  });
  const closeBoth = () => { if (client.readyState < WebSocket.CLOSING) client.close(); if (upstream.readyState < WebSocket.CLOSING) upstream.close(); };
  upstream.on('open', () => { while (pending.length && upstream.readyState === WebSocket.OPEN) { const item = pending.shift(); upstream.send(item.data, { binary: item.isBinary }); } });
  upstream.on('error', (err) => { console.error('[Nabr upstream error]', err.message); if (client.readyState === WebSocket.OPEN) client.close(1011, 'Upstream connection error'); });
  upstream.on('close', (code, reason) => { console.error('[Nabr upstream closed]', code, reason.toString()); if (client.readyState === WebSocket.OPEN) client.close(1011, 'Nabr upstream closed: ' + code); });
  client.on('error', closeBoth); client.on('close', closeBoth); upstream.on('close', closeBoth);
});
server.listen(PORT, '0.0.0.0', () => console.log(`Nabr proxy listening on :${PORT}`));
