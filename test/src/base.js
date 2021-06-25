import { useRoutes, getDOM } from 'valto';
import { nav } from './nav/nav.js';
import { index } from './index/index.js';
import { about } from './about/about.js';

const dom = getDOM('base.html');
const { document } = dom.window;
document.querySelector('nav').replaceWith(nav());

const routes = [
  [index(), '/'],
  [about(), '/about'],
];

useRoutes(routes, dom);
