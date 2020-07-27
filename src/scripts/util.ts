export const $ = (selector: string): NodeListOf<HTMLElement> | HTMLElement => {
  const el = document.querySelectorAll(selector)! as NodeListOf<HTMLElement>;
  if (!el) throw new Error(`Element with selector '${selector}' is not found`);
  return el.length === 1 ? el[0] : el;
};

export const getStyle = (el: HTMLElement, prop: string): number => {
  if (!(el && prop)) {
    throw new Error("Element and property name must be passed");
  }

  return parseInt(window.getComputedStyle(el).getPropertyValue(prop));
};

export const getTranslateX = (el: HTMLElement): number => {
  const style = window.getComputedStyle(el);
  const matrix = new WebKitCSSMatrix(style.webkitTransform);
  return matrix.m41;
};

export const getReadableDate = (timestamp: number): string => {
  if (!isNaN(timestamp)) {
    const dt = new Date(timestamp);
    return dt.toLocaleDateString();
  }
  return "A few days ago!";
};

export const getSortedScore = (scores: ITopScore[]): ITopScore[] => {
  return scores.sort((a, b) => {
    const valA = Object.values(a)[0];
    const valB = Object.values(b)[0];
    return valB - valA;
  });
};
