import fs from 'fs';
import path from 'path';

import { JSDOM } from 'jsdom';
import { buildSync as esbuild } from 'esbuild';
import { config } from './config';

const doc = new JSDOM('').window.document;

const copyRecursiveSync = (src: string, dest: string) => {
  const exists = fs.existsSync(src);
  if (!exists) return;

  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);

    for (const f of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, f), path.join(dest, f));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
};

export const build = (cfg: config) => {
  if (fs.existsSync(cfg.out) && fs.statSync(cfg.out).isDirectory()) {
    fs.rmSync(cfg.out, { recursive: true });
  }

  fs.mkdirSync(cfg.out);

  if (cfg.static) {
    copyRecursiveSync(cfg.static, path.join(cfg.out));
  }

  createPages(cfg);

  esbuild({
    entryPoints: [path.join(cfg.src, 'index.ts')],
    loader: { '.ts': 'ts' },
    bundle: true,
    outfile: path.join(cfg.out, 'bundle.js'),
  });
};

const createPages = (cfg: config) => {
  if (!cfg.pages) return;

  const baseFile = fs.readFileSync(path.join(cfg.pages, '_base.html'));

  for (const f of fs.readdirSync(cfg.pages)) {
    if (!f.endsWith('.html') || f === '_base.html') continue;

    const baseDOM = new JSDOM(baseFile);
    const baseDoc = baseDOM.window.document;
    const page = fs.readFileSync(path.join(cfg.pages, f)).toString();

    baseDoc.body.innerHTML += page;

    parse(baseDoc, cfg);

    let route: string;

    if (f === 'index.html') {
      route = f;
    } else {
      route = path.join(f.replace(/\.html/g, ''), 'index.html');
      fs.mkdirSync(path.join(cfg.out, f.replace(/\.html/g, '')));
    }

    fs.writeFileSync(path.join(cfg.out, route), baseDOM.serialize().replace(/>\s+</g, '><'));
  }
};

const parse = (root: Document, cfg: config) => {
  while (root.querySelectorAll('import').length > 0) {
    const i = root.querySelectorAll('import')[0];

    if (!i.hasAttribute('from') || i.attributes.length < 1) continue;

    const name = i.attributes[0].name;
    const from = i.getAttribute('from')!;

    i.remove();

    if (root.querySelector(`template#${name}`)) continue;

    const file = fs.readFileSync(path.join(cfg.src, from)).toString();

    // if (isStatic) {
    //   for (const el of Array.from(root.querySelectorAll(name))) {
    //     const temp = doc.createElement('div');
    //     temp.innerHTML = file;
    //     el.replaceWith(...Array.from(temp.childNodes));
    //   }
    //   continue;
    // }

    const div = doc.createElement('div');

    div.innerHTML = file;
    div.id = name;
    div.setAttribute('x-valto-replace-tem', '');

    if (div.firstElementChild?.tagName.toLowerCase() === 'valto-static') {
      for (const s of Array.from(root.querySelectorAll(name))) {
        s.outerHTML = div.firstElementChild.innerHTML;
      }
      continue;
    }

    root.body.prepend(div);
  }

  for (const t of Array.from(root.querySelectorAll(`valto-head`))) {
    root.head.append(...Array.from(t.childNodes));
    t.remove();
  }

  for (const t of Array.from(root.querySelectorAll(`div[x-valto-replace-tem]`))) {
    const tem = doc.createElement('template');
    tem.innerHTML = t.innerHTML;
    tem.id = t.id;

    t.replaceWith(tem);
  }
};
