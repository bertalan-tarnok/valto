import { useHTML } from 'valto';

export const button = ({ text = 'BUTTON', href = '/', style = '' }) => {
  const html = useHTML('button/button.html');
  const a = html.querySelector('a');

  if (style) a.classList.add(style);

  a.href = href;
  a.textContent = text;

  return html;
};
