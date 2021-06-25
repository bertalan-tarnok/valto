"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRoutes = exports.useCSS = exports.useHTML = exports.stringToDOM = exports.dist = exports.src = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jsdom_1 = require("jsdom");
// config
// TODO: config file
exports.src = path_1.default.join(process.cwd(), 'src');
exports.dist = path_1.default.join(process.cwd(), 'build');
// document setup
const base = fs_1.default.readFileSync(path_1.default.join(exports.src, 'base.html'));
const dom = new jsdom_1.JSDOM(base);
// TODO: provide some sort of export for `window` and `document` (has to be from the `dom` of the route)
const { window } = dom;
const { document } = window;
// functions
const stringToDOM = (s) => {
    const temp = document.createElement('div');
    temp.innerHTML = s;
    return Array.from(temp.children);
};
exports.stringToDOM = stringToDOM;
/**
 * Import a html file as `HTMLElement[]`
 * @param pathToFile Path relative to `src`
 */
const useHTML = (pathToFile) => {
    const file = fs_1.default.readFileSync(path_1.default.join(exports.src, pathToFile)).toString();
    const component = exports.stringToDOM(file);
    return component;
};
exports.useHTML = useHTML;
// TODO: css with routes
/**
 * @param pathToFile Path relative to `src`
 */
const useCSS = (pathToFile) => {
    const file = fs_1.default.readFileSync(path_1.default.join(exports.src, pathToFile)).toString();
    return file;
};
exports.useCSS = useCSS;
// const components: Component[] = [];
const render = (element, root = document.body) => {
    root.append(...element);
};
const useRoutes = (routes) => {
    fs_1.default.mkdirSync(exports.dist, { recursive: true });
    for (const file of fs_1.default.readdirSync(exports.dist)) {
        fs_1.default.rmSync(path_1.default.join(exports.dist, file), { recursive: true });
    }
    for (const route of routes) {
        const localDom = new jsdom_1.JSDOM(base);
        render(route[0].html, localDom.window.document.body);
        if (route[0].css) {
            // const style = stringToDOM(route[0].css);
            const style = localDom.window.document.createElement('style');
            style.textContent = route[0].css;
            render([style], localDom.window.document.head);
        }
        fs_1.default.mkdirSync(path_1.default.join(exports.dist, route[1]), { recursive: true });
        const minimizedHTML = localDom.serialize().replace(/(>\s+<)/g, '><');
        fs_1.default.writeFileSync(path_1.default.join(exports.dist, route[1], 'index.html'), minimizedHTML);
    }
};
exports.useRoutes = useRoutes;
