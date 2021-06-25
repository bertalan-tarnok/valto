"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRoutes = exports.useHTML = exports.stringToDOM = exports.getDocument = exports.getWindow = exports.getDOM = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jsdom_1 = require("jsdom");
const src = path_1.default.join(process.cwd(), 'src');
const dist = path_1.default.join(process.cwd(), 'build');
const base = fs_1.default.readFileSync(path_1.default.join(src, 'base.html'));
const dom = new jsdom_1.JSDOM(base);
const { window } = dom;
const { document } = window;
const getDOM = (pathToFile) => {
    const file = fs_1.default.readFileSync(path_1.default.join(src, pathToFile));
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
    const doc = exports.getDocument(pathToFile);
    const children = doc.body.children;
    const wrapper = doc.createElement('valto-wrapper');
    const valtoPath = doc.createElement('valto-path');
    valtoPath.setAttribute('href', path_1.default.join(src, pathToFile));
    wrapper.append(valtoPath, ...children);
    return wrapper;
};
exports.useHTML = useHTML;
const render = (element, root) => {
    root.append(element);
};
const useRoutes = (routes, baseDOM = dom) => {
    fs_1.default.mkdirSync(dist, { recursive: true });
    for (const file of fs_1.default.readdirSync(dist)) {
        fs_1.default.rmSync(path_1.default.join(dist, file), { recursive: true });
    }
    const replaceWithCSS = (pathToCSS, style) => {
        const css = fs_1.default.readFileSync(pathToCSS).toString();
        style.textContent += css.replace(/((?<={)|(?<=})|(?<=;)|(?<=,))\s+/g, '');
    };
    for (const route of routes) {
        const localDom = new jsdom_1.JSDOM(baseDOM.serialize());
        const localDoc = localDom.window.document;
        render(route[0], localDoc.body);
        const style = localDoc.createElement('style');
        const baseStyleLinks = Array.from(localDoc.head.querySelectorAll('link[rel="stylesheet"]'));
        for (const link of baseStyleLinks) {
            replaceWithCSS(path_1.default.join(src, link.href), style);
            link.remove();
        }
        const wrappers = Array.from(localDoc.querySelectorAll('valto-wrapper'));
        for (const wrapper of wrappers) {
            const htmlPath = wrapper.querySelector('valto-path').getAttribute('href');
            const styleLinks = Array.from(wrapper.querySelectorAll('link[rel="stylesheet"]'));
            for (const link of styleLinks) {
                replaceWithCSS(path_1.default.join(htmlPath, '../', link.href), style);
                link.remove();
            }
            wrapper.querySelector('valto-path').remove();
            wrapper.replaceWith(...wrapper.childNodes);
        }
        render(style, localDoc.head);
        fs_1.default.mkdirSync(path_1.default.join(dist, route[1]), { recursive: true });
        const minimizedHTML = localDom.serialize().replace(/(>\s+<)/g, '><');
        fs_1.default.writeFileSync(path_1.default.join(dist, route[1], 'index.html'), minimizedHTML);
    }
};
exports.useRoutes = useRoutes;
