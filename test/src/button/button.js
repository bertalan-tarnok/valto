import { useHTML } from 'valto';

export const button = (text = 'BUTTON', href = '/') => {
  const html = useHTML('button/button.html');
  const a = html.querySelector('a');

  a.href = href;
  a.textContent = text;

  return html;
};
