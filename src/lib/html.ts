import { parse, type HTMLElement } from "node-html-parser";

export interface HtmlCollection {
  length: number;
  each: (callback: (index: number, element: HTMLElement) => void) => HtmlCollection;
  first: () => HtmlCollection;
  find: (selector: string) => HtmlCollection;
  text: () => string;
  attr: (name: string) => string | null;
}

export interface CheerioLike {
  (selector: string): HtmlCollection;
  (element: HTMLElement): HtmlCollection;
}

function wrap(elements: HTMLElement[]): HtmlCollection {
  const collection: HtmlCollection = {
    length: elements.length,
    each(callback) {
      elements.forEach((element, index) => callback(index, element));
      return collection;
    },
    first() {
      return wrap(elements.slice(0, 1));
    },
    find(selector) {
      const found: HTMLElement[] = [];
      for (const element of elements) {
        found.push(...element.querySelectorAll(selector));
      }
      return wrap(found);
    },
    text() {
      return elements.map((element) => element.text).join("");
    },
    attr(name) {
      const element = elements[0];
      const value = element?.getAttribute(name);
      return value === undefined ? null : value;
    },
  };
  return collection;
}

/** Carrega HTML via node-html-parser (CJS-safe) mantendo uma API de selecao estilo `$`. */
export function loadHtml(html: string): CheerioLike {
  const root = parse(html);
  const query = (selector: string): HtmlCollection => wrap(root.querySelectorAll(selector));
  const single = (element: HTMLElement): HtmlCollection => wrap([element]);
  const $: CheerioLike = (argument: string | HTMLElement) =>
    typeof argument === "string" ? query(argument) : single(argument);
  return $;
}
