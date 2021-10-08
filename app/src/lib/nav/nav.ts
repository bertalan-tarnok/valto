import { addComponent, getInside } from '@fw';
import '@lib/btn/btn';

const name = 'n-av';

class Nav extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = getInside(name) || '';
  }
}

addComponent(name, Nav);
