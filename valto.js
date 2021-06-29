"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRoutes = exports.useHTML = exports.stringToDOM = exports.getDocument = exports.getWindow = exports.getDOM = exports.dev = exports.dist = exports.src = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jsdom_1 = require("jsdom");
exports.src = path_1.default.join(process.cwd(), 'src');
exports.dist = path_1.default.join(process.cwd(), 'build');
exports.dev = true;
const dom = new jsdom_1.JSDOM('');
const { window } = dom;
const { document } = window;
const getDOM = (pathToFile) => {
    const file = fs_1.default.readFileSync(path_1.default.join(exports.src, pathToFile));
    return new jsdom_1.JSDOM(file);
};
exports.getDOM = getDOM;
const getWindow = (pathToFile) => {
    return exports.getDOM(pathToFile).window;
};
exports.getWindow = getWindow;
const getDocument = (pathToFile) => {
    return exports.getDOM(pathToFile).window.document;
};
exports.getDocument = getDocument;
const stringToDOM = (s) => {
    const temp = document.createElement('div');
    temp.innerHTML = s;
    return Array.from(temp.childNodes);
};
exports.stringToDOM = stringToDOM;
const useHTML = (pathToFile) => {
    const html = exports.stringToDOM(fs_1.default.readFileSync(path_1.default.join(exports.src, pathToFile)).toString());
    const wrapper = document.createElement('valto-wrapper');
    const valtoPath = document.createElement('valto-path');
    valtoPath.setAttribute('href', path_1.default.join(exports.src, pathToFile));
    wrapper.append(valtoPath, ...html);
    return wrapper;
};
exports.useHTML = useHTML;
const render = (element, root) => {
    root.append(element);
};
const useRoutes = (routes, baseDOM = dom) => {
    var _a;
    fs_1.default.mkdirSync(exports.dist, { recursive: true });
    for (const file of fs_1.default.readdirSync(exports.dist)) {
        fs_1.default.rmSync(path_1.default.join(exports.dist, file), { recursive: true });
    }
    const usedCSSFiles = [];
    const replaceWithCSS = (pathToCSS, style) => {
        if (usedCSSFiles.includes(pathToCSS))
            return;
        const css = fs_1.default.readFileSync(pathToCSS).toString();
        usedCSSFiles.push(pathToCSS);
        style.textContent += css.replace(/((?<={)|(?<=})|(?<=;)|(?<=,))\s+/g, '');
    };
    for (const route of routes) {
        usedCSSFiles.length = 0;
        const localDom = new jsdom_1.JSDOM(baseDOM.serialize());
        const localDoc = localDom.window.document;
        render(route[0], localDoc.body);
        const style = localDoc.createElement('style');
        const baseStyleLinks = Array.from(localDoc.head.querySelectorAll('link[rel="stylesheet"]'));
        for (const link of baseStyleLinks) {
            replaceWithCSS(path_1.default.join(exports.src, link.href), style);
            link.remove();
        }
        const wrappers = Array.from(localDoc.querySelectorAll('valto-wrapper'));
        for (const wrapper of wrappers) {
            const htmlPath = wrapper.querySelector('valto-path').getAttribute('href');
            for (const child of Array.from(wrapper.childNodes)) {
                if (((_a = child === null || child === void 0 ? void 0 : child.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== 'link')
                    continue;
                const link = child;
                if ((link === null || link === void 0 ? void 0 : link.href) && (link === null || link === void 0 ? void 0 : link.rel) === 'stylesheet') {
                    replaceWithCSS(path_1.default.join(htmlPath, '../', link.href), style);
                    link.remove();
                }
            }
            wrapper.querySelector('valto-path').remove();
            wrapper.replaceWith(...wrapper.childNodes);
        }
        render(style, localDoc.head);
        if (exports.dev) {
            const script = localDoc.createElement('script');
            script.textContent = fs_1.default.readFileSync(path_1.default.join(__dirname, 'dev.js')).toString();
            render(script, localDoc.head);
        }
        fs_1.default.mkdirSync(path_1.default.join(exports.dist, route[1]), { recursive: true });
        const minimizedHTML = localDom.serialize().replace(/(>\s+<)/g, '><');
        fs_1.default.writeFileSync(path_1.default.join(exports.dist, route[1], 'index.html'), minimizedHTML);
    }
};
exports.useRoutes = useRoutes;
