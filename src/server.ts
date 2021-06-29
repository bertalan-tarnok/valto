import fs from 'fs';
import http from 'http';
import path from 'path';
import WebSocket from 'ws';
import { watch } from 'chokidar';

const port = 7500;

let failed = false;

const server = http.createServer((req, res) => {
  try {
    const data = fs
      .readFileSync(path.join(process.cwd(), 'test', 'build', req.url || '', 'index.html'))
      .toString();
    res.writeHead(200);
    res.end(data);
    failed = false;
  } catch (err) {
    res.end(JSON.stringify(err));
    res.writeHead(404);
    failed = true;
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  // console.log('WS connected');

  watch(path.join(__dirname, 'test', 'build'), { ignoreInitial: true }).on('all', () => {
    tryReload(ws);
  });
});

const tryReload = (ws: WebSocket) => {
  let tries = 0;

  const lopper = setInterval(() => {
    ws.send('reload');
    if (tries > 400 || !failed) clearInterval(lopper);
    tries++;
  }, 50);
};

export const runServer = () => {
  server.listen(port, () => console.log(`Dev server running on http://localhost:${port}`));
};

runServer();
