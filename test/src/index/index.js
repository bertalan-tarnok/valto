import { useHTML, useCSS } from 'valto';
import { button } from '../button/button.js';

export const index = () => ({
  html: [
    ...useHTML('index/index.html'),
    ...button('/', 'button').html,
    ...button('/about', 'About').html,
  ],
  css: useCSS('index/index.css') + button().css,
});
