import { JSDOM } from "jsdom";

export interface HtmlCollection {
  length: number;
  each: (callback: (index: number, element: Element) => void) => HtmlCollection;
  first: () => HtmlCollection;
  find: (selector: string) => HtmlCollection;
  text: () => string;
  attr: (name: string) => string | null;
}

export interface CheerioLike {
  (selector: string): HtmlCollection;
  (element: Element): HtmlCollection;
}

function wrap(elements: Element[]): HtmlCollection {
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
      const found: Element[] = [];
      for (const element of elements) {
        found.push(...Array.from(element.querySelectorAll(selector)));
      }
      return wrap(found);
    },
    text() {
      return elements.map((element) => element.textContent ?? "").join("");
    },
    attr(name) {
      const element = elements[0];
      return element ? element.getAttribute(name) : null;
    },
  };
  return collection;
}

/** Carrega HTML via jsdom (CJS-safe) mantendo uma API de selecao estilo `$`. */
export function loadHtml(html: string): CheerioLike {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const query = (selector: string): HtmlCollection =>
    wrap(Array.from(document.querySelectorAll(selector)));
  const single = (element: Element): HtmlCollection => wrap([element]);
  const $: CheerioLike = (argument: string | Element) =>
    typeof argument === "string" ? query(argument) : single(argument);
  return $;
}
