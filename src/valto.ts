import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// TODO: Websocket dev server
//  https://nodejs.org/en/knowledge/HTTP/servers/how-to-serve-static-files/

// config
// TODO: config file
const src = path.join(process.cwd(), 'src');
const dist = path.join(process.cwd(), 'build');

// document setup
const base = fs.readFileSync(path.join(src, 'base.html'));
const dom = new JSDOM(base);

const { window } = dom;
const { document } = window;

/**
 * Gets the DOM of the html file
 * @param pathToFile Path relative to `src`
 */
export const getDOM = (pathToFile: string) => {
  const file = fs.readFileSync(path.join(src, pathToFile));
  return new JSDOM(file);
};

/**
 * Gets the `window` of the html file
 * @param pathToFile Path relative to `src`
 */
export const getWindow = (pathToFile: string) => {
  return getDOM(pathToFile).window;
};

/**
 * Gets the `document` of the html file
 * @param pathToFile Path relative to `src`
 */
export const getDocument = (pathToFile: string) => {
  return getDOM(pathToFile).window.document;
};

export const stringToDOM = (s: string) => {
  const temp = document.createElement('div');
  temp.innerHTML = s;
  return Array.from(temp.childNodes) as Element[];
};

/**
 * Imports a html file as an `Element`
 * @param pathToFile Path relative to `src`
 */
export const useHTML = (pathToFile: string) => {
  const doc = getDocument(pathToFile);
  const children = doc.body.children;
  const wrapper = doc.createElement('valto-wrapper');

  // store the path for later (css stuff)
  const valtoPath = doc.createElement('valto-path');
  valtoPath.setAttribute('href', path.join(src, pathToFile));
  wrapper.append(valtoPath, ...children);
  return wrapper;
};

const render = (element: Element, root: Element) => {
  root.append(element);
};

export type Route = [Element, string];

/**
 * Creates the html files for every route in `routes[]`
 * @param baseFilePath Path relative to `src`
 */
export const useRoutes = (routes: Route[], baseDOM = dom) => {
  // create build folder
  fs.mkdirSync(dist, { recursive: true });

  // empty build folder
  for (const file of fs.readdirSync(dist)) {
    fs.rmSync(path.join(dist, file), { recursive: true });
  }

  const replaceWithCSS = (pathToCSS: string, style: HTMLStyleElement) => {
    const css = fs.readFileSync(pathToCSS).toString();
    style.textContent += css.replace(/((?<={)|(?<=})|(?<=;)|(?<=,))\s+/g, '');
  };

  for (const route of routes) {
    // dom of the route
    const localDom = new JSDOM(baseDOM.serialize());
    const localDoc = localDom.window.document;

    render(route[0], localDoc.body);

    const style = localDoc.createElement('style');

    // base.html css links
    const baseStyleLinks = Array.from(
      localDoc.head.querySelectorAll('link[rel="stylesheet"]')
    ) as HTMLLinkElement[];

    for (const link of baseStyleLinks) {
      replaceWithCSS(path.join(src, link.href), style);
      link.remove();
    }

    // component wrappers
    const wrappers = Array.from(localDoc.querySelectorAll('valto-wrapper'));

    for (const wrapper of wrappers) {
      const htmlPath = wrapper.querySelector('valto-path')!.getAttribute('href')!;

      // css links
      const styleLinks = Array.from(
        wrapper.querySelectorAll('link[rel="stylesheet"]')
      ) as HTMLLinkElement[];

      for (const link of styleLinks) {
        replaceWithCSS(path.join(htmlPath, '../', link.href), style);
        link.remove();
      }

      // remove valto related stuff
      wrapper.querySelector('valto-path')!.remove();
      wrapper.replaceWith(...wrapper.childNodes);
    }

    render(style, localDoc.head);

    fs.mkdirSync(path.join(dist, route[1]), { recursive: true });

    const minimizedHTML = localDom.serialize().replace(/(>\s+<)/g, '><');
    fs.writeFileSync(path.join(dist, route[1], 'index.html'), minimizedHTML);
  }
};
