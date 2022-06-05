import "./style.css";

import { component, state, tag } from "../../valto/dist";

const counter = (speed: number) =>
  component((self) => {
    self.classList.add("counter");

    const btn = tag("button");

    const count = state(0);
    let down = false;

    count.sub(() => {
      btn.textContent = `Count: ${count.get()}`;
    }, true);

    setInterval(() => {
      if (!down) return;

      count.set(count.get() + 1);
    }, 1000 / speed);

    btn.addEventListener("pointerdown", () => {
      down = true;
    });

    window.addEventListener("pointerup", () => {
      down = false;
    });

    self.append(btn);
  });

const app = () =>
  component((self) => {
    self.classList.add("app");

    self.append(
      tag("h1", { text: "Hello" }),
      tag("p", { text: "world" }),
      tag("div", {
        ins: [counter(10), counter(50)],
      })
    );
  });

document.body.append(app());
