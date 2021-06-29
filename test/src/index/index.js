import { useHTML } from 'valto';
import { button } from '../button/button.js';

export const index = () => {
  const html = useHTML('index/index.html');

  html.querySelectorAll('btn').forEach((btn) => {
    btn.replaceWith(
      button({ text: btn.textContent, style: btn.hasAttribute('accent') ? 'accent' : '' })
    );
  });

  return html;
};
