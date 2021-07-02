import { useHTML } from 'valto';
import { button } from '../button/button.js';
import { logo } from '../logo/logo.js';

export const nav = () => {
  const html = useHTML('nav/nav.html');
  const btns = Array.from(html.querySelectorAll('btn'));
  html.querySelector('logo').replaceWith(logo());

  for (const btn of btns) {
    btn.replaceWith(button(btn));
  }

  return html;
};
