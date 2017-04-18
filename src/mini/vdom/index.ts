interface HtmlAttributes {
  name?: string;
  value?: any;
}

export interface HtmlElement {
  tag: string;
  attributes: HtmlAttributes;
  children: HtmlNode[];
}

export interface HtmlText {
  content: string;
}

export type HtmlNode = HtmlElement | HtmlText;

type AttrsOrNode = HtmlAttributes | HtmlNode;

export function node(tag: string, attrsOrChild: AttrsOrNode, children: HtmlNode[]): HtmlElement {
  let attributes: HtmlAttributes;
  if (isNode(attrsOrChild)) {
    children.splice(0, 0, attrsOrChild);

    attributes = {};
  } else {
    attributes = attrsOrChild;
  }

  return { tag, attributes, children };
}

export function text(content: string): HtmlText {
  return { content };
}

export function div(attrsOrChild: AttrsOrNode, ...children: HtmlNode[]): HtmlElement {
  return node("div", attrsOrChild, children);
}

export function h1(attrsOrChild: AttrsOrNode, ...children: HtmlNode[]): HtmlElement {
  return node("h1", attrsOrChild, children);
}

export function h2(attrsOrChild: AttrsOrNode, ...children: HtmlNode[]): HtmlElement {
  return node("h2", attrsOrChild, children);
}

export function h3(attrsOrChild: AttrsOrNode, ...children: HtmlNode[]): HtmlElement {
  return node("h3", attrsOrChild, children);
}

export function h4(attrsOrChild: AttrsOrNode, ...children: HtmlNode[]): HtmlElement {
  return node("h4", attrsOrChild, children);
}

export function h5(attrsOrChild: AttrsOrNode, ...children: HtmlNode[]): HtmlElement {
  return node("h5", attrsOrChild, children);
}

export function h6(attrsOrChild: AttrsOrNode, ...children: HtmlNode[]): HtmlElement {
  return node("h6", attrsOrChild, children);
}

export function isNode(ob: AttrsOrNode): ob is HtmlNode {
  return (
    (<HtmlElement>ob).tag !== undefined ||
    (<HtmlText>ob).content !== undefined
  );
}

export function isElement(node: HtmlNode): node is HtmlElement {
  return (<HtmlElement>node).tag !== undefined;
}

export function isText(node: HtmlNode): node is HtmlText {
  return (<HtmlText>node).content !== undefined;
}
