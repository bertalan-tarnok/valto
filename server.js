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
const server = http_1.default.createServer((req, res) => {
    try {
        const data = fs_1.default
            .readFileSync(path_1.default.join(process.cwd(), 'test', 'build', req.url || '', 'index.html'))
            .toString();
        res.writeHead(200);
        res.end(data);
        failed = false;
    }
    catch (err) {
        res.end(JSON.stringify(err));
        res.writeHead(404);
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
