import fs from 'fs';
import http from 'http';
import path from 'path';
import WebSocket from 'ws';
import { watch } from 'chokidar';

const port = 7500;

let failed = false;

const buildFolder = path.join(process.cwd(), 'build');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
};

const server = http.createServer((req, res) => {
  try {
    let url = req.url || '';

    if (fs.lstatSync(path.join(buildFolder, url)).isDirectory()) {
      url = path.join(url, 'index.html');
    }

    const filePath = path.join(buildFolder, url);
    const file = fs.readFileSync(filePath);

    const contentType = mimeTypes[path.extname(filePath) as keyof typeof mimeTypes] || '';

    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', contentType);
    res.end(file, 'utf-8');
    failed = false;
  } catch (err) {
    res.writeHead(404);
    res.end('ERROR:\n' + JSON.stringify(err));
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
