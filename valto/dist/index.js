"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var jsdom_1 = require("jsdom");
var esbuild_1 = require("esbuild");
var doc = new jsdom_1.JSDOM('').window.document;
var copyRecursiveSync = function (src, dest) {
    var exists = fs_1.default.existsSync(src);
    if (!exists)
        return;
    var stats = fs_1.default.statSync(src);
    var isDirectory = stats.isDirectory();
    if (isDirectory) {
        if (!fs_1.default.existsSync(dest))
            fs_1.default.mkdirSync(dest);
        for (var _i = 0, _a = fs_1.default.readdirSync(src); _i < _a.length; _i++) {
            var f = _a[_i];
            copyRecursiveSync(path_1.default.join(src, f), path_1.default.join(dest, f));
        }
    }
    else {
        fs_1.default.copyFileSync(src, dest);
    }
};
var build = function (cfg) {
    // const base = new JSDOM(fs.readFileSync(path.join(cfg.src, cfg.pages!, '_base.html')));
    // const baseDoc = base.window.document;
    // parse(baseDoc.body, cfg);
    fs_1.default.rmSync(cfg.out, { recursive: true });
    fs_1.default.mkdirSync(cfg.out);
    copyRecursiveSync(cfg.static, path_1.default.join(cfg.out));
    // fs.writeFileSync(path.join(cfg.out, 'index.html'), base.serialize());
    createPages(cfg);
    (0, esbuild_1.buildSync)({
        entryPoints: [path_1.default.join(cfg.src, 'index.ts')],
        loader: { '.ts': 'ts' },
        bundle: true,
        outfile: path_1.default.join(cfg.out, 'bundle.js'),
    });
};
exports.build = build;
var createPages = function (cfg) {
    if (!cfg.pages)
        return;
    var baseFile = fs_1.default.readFileSync(path_1.default.join(cfg.pages, '_base.html'));
    for (var _i = 0, _a = fs_1.default.readdirSync(cfg.pages); _i < _a.length; _i++) {
        var f = _a[_i];
        if (!f.endsWith('.html') || f === '_base.html')
            continue;
        var baseDOM = new jsdom_1.JSDOM(baseFile);
        var baseDoc = baseDOM.window.document;
        var page = fs_1.default.readFileSync(path_1.default.join(cfg.pages, f)).toString();
        baseDoc.body.innerHTML += page;
        parse(baseDoc.body, cfg);
        var route = void 0;
        if (f === 'index.html') {
            route = f;
        }
        else {
            route = path_1.default.join(f.replace(/\.html/g, ''), 'index.html');
            fs_1.default.mkdirSync(path_1.default.join(cfg.out, f.replace(/\.html/g, '')));
        }
        fs_1.default.writeFileSync(path_1.default.join(cfg.out, route), baseDOM.serialize());
    }
};
var parse = function (root, cfg) {
    while (root.querySelectorAll('import').length > 0) {
        var i = root.querySelectorAll('import')[0];
        if (!i.hasAttribute('from') || i.attributes.length < 1)
            continue;
        var name_1 = i.attributes[0].name;
        var from = i.getAttribute('from');
        i.remove();
        if (root.querySelector("template#" + name_1))
            continue;
        var file = fs_1.default.readFileSync(path_1.default.join(cfg.src, from)).toString();
        var tem = doc.createElement('div');
        tem.innerHTML = file;
        tem.id = name_1;
        tem.setAttribute('x-valto-replace-tem', '');
        root.prepend(tem);
    }
    for (var _i = 0, _a = Array.from(root.querySelectorAll("div[x-valto-replace-tem]")); _i < _a.length; _i++) {
        var t = _a[_i];
        var tem = doc.createElement('template');
        tem.innerHTML = t.innerHTML;
        tem.id = t.id;
        t.replaceWith(tem);
    }
};
