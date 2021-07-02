import { useHTML } from 'valto';

export const button = (btn) => {
  const html = useHTML('button/button.html');
  const a = html.querySelector('a');

  if (btn.getAttribute('type')) a.classList.add(btn.getAttribute('type'));

  a.href = btn.getAttribute('href') || '';
  a.textContent = btn.textContent || '';

  return html;
};
