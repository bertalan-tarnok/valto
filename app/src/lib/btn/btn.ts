import { addComponent, getInside } from '@fw';

const name = 'b-tn';

class Btn extends HTMLElement {
  constructor() {
    super();

    const text = this.textContent;

    this.innerHTML = getInside(name) || '';
    const a = this.querySelector('a');

    if (a) {
      a.href = this.getAttribute('href') || '';

      a.textContent = text;
    }
  }
}

addComponent(name, Btn);
