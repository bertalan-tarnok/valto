import { useHTML } from 'valto';
import { button } from '../button/button.js';

export const form = () => {
  const html = useHTML('form/form.html');

  const btn = html.querySelector('btn');
  btn.replaceWith(button(btn));

  return html;
};
