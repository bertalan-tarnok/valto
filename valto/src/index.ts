type Tag = {
  attrs?: Record<string, string>;
  ins?: HTMLElement | HTMLElement[];
  text?: string;
};

export const tag = <T extends keyof HTMLElementTagNameMap>(
  tagn: T,
  t: Tag = { attrs: {}, ins: [], text: "" }
) => {
  const el = document.createElement(tagn);

  for (const key in t.attrs) {
    el.setAttribute(key, t.attrs[key]);
  }

  el.textContent = t.text!;

  if (Array.isArray(t.ins)) {
    el.append(...t.ins);
  } else if (t.ins) {
    el.append(t.ins);
  }

  return el;
};

export const state = <T>(value: T) => {
  const subs: (() => void)[] = [];

  const get = () => value;

  const set = (newValue: T) => {
    value = newValue;

    for (const s of subs) {
      s();
    }
  };

  const sub = (f: () => void, onInit = false) => {
    subs.push(f);

    if (onInit) f();
  };

  return { get, set, sub };
};

let componentID = 0;

export const component = (f: (self: HTMLElement) => void) => {
  class X extends HTMLElement {
    constructor() {
      super();

      f(this);
    }
  }

  customElements.define(`vlt-${(componentID++).toString(16)}`, X);

  return new X() as HTMLElement;
};
