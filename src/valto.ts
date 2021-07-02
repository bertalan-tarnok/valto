import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// config
// TODO: config file
export const src = path.join(process.cwd(), 'src');
export const dist = path.join(process.cwd(), 'build');
export const publicFolder = path.join(process.cwd(), 'public');

export const dev = true;

// document setup);
const dom = new JSDOM('');

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

let wrapperId = 0;

/**
 * Imports a html file as an `Element`
 * @param pathToFile Path relative to `src`
 */
export const useHTML = (pathToFile: string) => {
  const html = stringToDOM(fs.readFileSync(path.join(src, pathToFile)).toString());

  const wrapper = document.createElement('valto-wrapper');
  wrapper.id = wrapperId.toString();
  wrapperId++;

  // store the path for later (css stuff)
  const valtoPath = document.createElement('valto-path');
  valtoPath.setAttribute('href', path.join(src, pathToFile));

  wrapper.append(valtoPath, ...html);

  return wrapper;
};

const render = (element: Element, root: Element) => {
  root.append(element);
};

const getAllParents = (el: HTMLElement) => {
  const parents: HTMLElement[] = [];
  el = el.parentElement!;
  while (el.parentElement) {
    parents.unshift(el);
    el = el.parentElement!;
  }

  return parents;
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

  const usedCSSFiles: string[] = [];

  const replaceWithCSS = (pathToCSS: string, style: HTMLStyleElement) => {
    if (usedCSSFiles.includes(pathToCSS)) return;

    const css = fs.readFileSync(pathToCSS).toString();
    usedCSSFiles.push(pathToCSS);
    style.textContent += css.replace(/((?<={)|(?<=})|(?<=;)|(?<=,))\s+/g, '');
  };

  for (const route of routes) {
    usedCSSFiles.length = 0;
    // dom of the route
    const localDom = new JSDOM(baseDOM.serialize());
    const localDoc = localDom.window.document;

    render(route[0], localDoc.body);

    const style = localDoc.createElement('style');

    // base.html css links
    for (const link of Array.from(
      localDoc.head.querySelectorAll('link[rel="stylesheet"]')
    ) as HTMLLinkElement[]) {
      replaceWithCSS(path.join(src, link.href), style);
      link.remove();
    }

    // component wrappers
    const wrappers = Array.from(localDoc.querySelectorAll('valto-wrapper'));

    for (const wrapper of wrappers) {
      const htmlPath = wrapper.querySelector('valto-path')!.getAttribute('href')!;

      // css links
      for (const link of Array.from(
        wrapper.querySelectorAll('link[rel="stylesheet"]')
      ) as HTMLLinkElement[]) {
        const parentTagNames = getAllParents(link).map((p) => p.tagName.toLowerCase());
        const parentIds = getAllParents(link).map((p) => p.id);

        if (wrapper.id !== parentIds[parentTagNames.lastIndexOf('valto-wrapper')]) {
          continue;
        }

        replaceWithCSS(path.join(htmlPath, '../', link.href), style);
        link.remove();
      }

      // TODO: img

      // remove valto related stuff
      wrapper.querySelector('valto-path')!.remove();
      wrapper.replaceWith(...wrapper.childNodes);
    }

    render(style, localDoc.head);

    if (dev) {
      const script = localDoc.createElement('script');
      script.textContent = fs.readFileSync(path.join(__dirname, 'dev.js')).toString();
      render(script, localDoc.head);
    }

    fs.mkdirSync(path.join(dist, route[1]), { recursive: true });

    const minimizedHTML = localDom.serialize().replace(/(>\s+<)/g, '><');
    fs.writeFileSync(path.join(dist, route[1], 'index.html'), minimizedHTML);
  }

  // public folder
  const copyFolder = (from: string, to: string) => {
    fs.mkdirSync(to, { recursive: true });

    for (const entry of fs.readdirSync(from)) {
      if (fs.lstatSync(path.join(from, entry)).isDirectory()) {
        copyFolder(path.join(from, entry), path.join(to, entry));
      } else {
        // files
        fs.copyFileSync(path.join(from, entry), path.join(to, entry));
      }
    }
  };

  copyFolder(publicFolder, path.join(dist));
};
