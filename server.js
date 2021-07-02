"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runServer = void 0;
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const ws_1 = __importDefault(require("ws"));
const chokidar_1 = require("chokidar");
const port = 7500;
let failed = false;
const buildFolder = path_1.default.join(process.cwd(), 'build');
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
const server = http_1.default.createServer((req, res) => {
    try {
        let url = req.url || '';
        if (fs_1.default.lstatSync(path_1.default.join(buildFolder, url)).isDirectory()) {
            url = path_1.default.join(url, 'index.html');
        }
        const filePath = path_1.default.join(buildFolder, url);
        const file = fs_1.default.readFileSync(filePath);
        const contentType = mimeTypes[path_1.default.extname(filePath)] || '';
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Content-Type', contentType);
        res.end(file, 'utf-8');
        failed = false;
    }
    catch (err) {
        res.writeHead(404);
        res.end('ERROR:\n' + JSON.stringify(err));
        failed = true;
    }
});
const wss = new ws_1.default.Server({ server });
wss.on('connection', (ws) => {
    chokidar_1.watch(path_1.default.join(__dirname, 'test', 'build'), { ignoreInitial: true }).on('all', () => {
        tryReload(ws);
    });
});
const tryReload = (ws) => {
    let tries = 0;
    const lopper = setInterval(() => {
        ws.send('reload');
        if (tries > 400 || !failed)
            clearInterval(lopper);
        tries++;
    }, 50);
};
const runServer = () => {
    server.listen(port, () => console.log(`Dev server running on http://localhost:${port}`));
};
exports.runServer = runServer;
exports.runServer();
