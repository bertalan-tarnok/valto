import { useHTML, useCSS } from 'valto';

export const about = () => ({
  html: [...useHTML('about/about.html')],
  css: useCSS('about/about.css'),
});
