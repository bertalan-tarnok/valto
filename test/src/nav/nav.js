import { useHTML } from 'valto';
import { button } from '../button/button.js';

export const nav = () => {
  const html = useHTML('nav/nav.html');
  const btns = Array.from(html.querySelectorAll('btn'));

  for (const btn of btns) {
    const properties = {
      text: btn.textContent,
      href: btn.getAttribute('href'),
      style: btn.textContent === 'Contact' ? '' : 'transparent',
    };

    btn.replaceWith(button(properties));
  }

  return html;
};
