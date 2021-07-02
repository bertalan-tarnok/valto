import { useRoutes, getDOM } from 'valto';
import { nav } from './nav/nav.js';
import { index } from './index/index.js';
import { signUp } from './signUp/signUp.js';

const dom = getDOM('base.html');
const { document } = dom.window;
document.querySelector('nav').replaceWith(nav());

const routes = [
  [index(), '/'],
  [signUp(), '/sign-up'],
];

useRoutes(routes, dom);
