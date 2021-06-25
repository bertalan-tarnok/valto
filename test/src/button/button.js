import { useHTML, useCSS } from 'valto';

export const button = (href = '/', text = '') => {
  const html = useHTML('button/button.html');

  html[0].href = href;
  html[0].textContent = text;
  return { html, css: useCSS('button/button.css') };
};
