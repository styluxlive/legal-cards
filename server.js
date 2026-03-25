import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

// Serve static project files
app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data?.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
      // placeholder: handle game channel messages here
    } catch (e) {
      // ignore non-json messages
    }
  });

  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to Ckrit MaCard WebSocket' }));
});

server.listen(port, () => {
  console.log(`Ckrit MaCard server running at http://localhost:${port}`);
});
