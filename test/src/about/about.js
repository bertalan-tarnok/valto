import { useHTML } from 'valto';
import { button } from '../button/button.js';

export const about = () => {
  const html = useHTML('about/about.html');
  const btn = html.querySelector('btn');
  btn.replaceWith(button(btn.textContent));

  return html;
};
