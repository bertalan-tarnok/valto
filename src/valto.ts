import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// config
// TODO: config file
export const src = path.join(process.cwd(), 'src');
export const dist = path.join(process.cwd(), 'build');

// document setup
const base = fs.readFileSync(path.join(src, 'base.html'));
const dom = new JSDOM(base);

// TODO: provide some sort of export for `window` and `document` (has to be from the `dom` of the route)
const { window } = dom;
const { document } = window;

// functions
export const stringToDOM = (s: string) => {
  const temp = document.createElement('div');
  temp.innerHTML = s;
  return Array.from(temp.children) as HTMLElement[];
};

/**
 * Import a html file as `HTMLElement[]`
 * @param pathToFile Path relative to `src`
 */
export const useHTML = (pathToFile: string): HTMLElement[] => {
  const file = fs.readFileSync(path.join(src, pathToFile)).toString();
  const component = stringToDOM(file);

  return component;
};

// TODO: css with routes
export const useCSS = (path: fs.PathLike) => {
  const file = fs.readFileSync(path).toString();
  const style = document.createElement('style');

  style.textContent += file;

  document.head.append(style);
};

const render = (element: Element[], root: HTMLElement = document.body) => {
  root.append(...element);
};

export type Route = [Element[], string];

export const useRoutes = (routes: Route[]) => {
  fs.mkdirSync(dist, { recursive: true });

  for (const file of fs.readdirSync(dist)) {
    fs.rmSync(path.join(dist, file), { recursive: true });
  }

  for (const route of routes) {
    const localDom = new JSDOM(base);

    render(route[0], localDom.window.document.body);

    fs.mkdirSync(path.join(dist, route[1]), { recursive: true });

    const minimizedHTML = localDom.serialize().replace(/(>\s+<)/g, '><');
    fs.writeFileSync(path.join(dist, route[1], 'index.html'), minimizedHTML);
  }

};
