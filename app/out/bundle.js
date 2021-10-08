(() => {
  // src/lib/framework.ts
  var addComponent = (name3, element) => {
    customElements.define(name3, element);
  };
  var getInside = (name3) => {
    const tem = document.querySelector(`template#${name3}`);
    if (!tem)
      return;
    return tem.innerHTML;
  };

  // src/lib/btn/btn.ts
  var name = "b-tn";
  var Btn = class extends HTMLElement {
    constructor() {
      super();
      const text = this.textContent;
      this.innerHTML = getInside(name) || "";
      const a = this.querySelector("a");
      if (a) {
        a.href = this.getAttribute("href") || "";
        a.textContent = text;
      }
    }
  };
  addComponent(name, Btn);

  // src/lib/nav/nav.ts
  var name2 = "n-av";
  var Nav = class extends HTMLElement {
    constructor() {
      super();
      this.innerHTML = getInside(name2) || "";
    }
  };
  addComponent(name2, Nav);
})();
