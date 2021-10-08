export const addComponent = (name: string, element: CustomElementConstructor) => {
  customElements.define(name, element);
};

export const getInside = (name: string) => {
  const tem = document.querySelector(`template#${name}`) as HTMLTemplateElement;

  if (!tem) return;
  return tem.innerHTML;
};
