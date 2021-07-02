import { useHTML } from 'valto';
import { form } from '../form/form.js';

export const signUp = () => {
  const html = useHTML('signUp/signUp.html');
  html.querySelector('form').replaceWith(form());

  return html;
};
