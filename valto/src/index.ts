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
  // const base = new JSDOM(fs.readFileSync(path.join(cfg.src, cfg.pages!, '_base.html')));
  // const baseDoc = base.window.document;

  // parse(baseDoc.body, cfg);

  fs.rmSync(cfg.out, { recursive: true });
  fs.mkdirSync(cfg.out);

  copyRecursiveSync(cfg.static, path.join(cfg.out));

  // fs.writeFileSync(path.join(cfg.out, 'index.html'), base.serialize());
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

    parse(baseDoc.body, cfg);

    let route: string;

    if (f === 'index.html') {
      route = f;
    } else {
      route = path.join(f.replace(/\.html/g, ''), 'index.html');
      fs.mkdirSync(path.join(cfg.out, f.replace(/\.html/g, '')));
    }

    fs.writeFileSync(path.join(cfg.out, route), baseDOM.serialize());
  }
};

const parse = (root: HTMLElement, cfg: config) => {
  while (root.querySelectorAll('import').length > 0) {
    const i = root.querySelectorAll('import')[0];

    if (!i.hasAttribute('from') || i.attributes.length < 1) continue;

    const name = i.attributes[0].name;
    const from = i.getAttribute('from')!;

    i.remove();

    if (root.querySelector(`template#${name}`)) continue;

    const file = fs.readFileSync(path.join(cfg.src, from)).toString();
    const tem = doc.createElement('div');

    tem.innerHTML = file;
    tem.id = name;
    tem.setAttribute('x-valto-replace-tem', '');

    root.prepend(tem);
  }

  for (const t of Array.from(root.querySelectorAll(`div[x-valto-replace-tem]`))) {
    const tem = doc.createElement('template');
    tem.innerHTML = t.innerHTML;
    tem.id = t.id;

    t.replaceWith(tem);
  }
};
