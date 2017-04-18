import BatchRenderer, { RenderOpKind, RenderOp, Renderer } from "../renderer";
import { HtmlNode, isElement } from "./";
import diff from "./diff";


/** Replaces the contents of the root node with a given node. */
class ReplaceRoot implements RenderOp<Element> {
  kind = "write" as RenderOpKind;

  constructor(private node: Node) { }

  perform(root: Element, timestamp: number): void {
    while (root.lastChild) {
      root.removeChild(root.lastChild);
    }

    root.appendChild(this.node);
  }
}


/** Appends a node to the tree. */
class Append implements RenderOp<Element> {
  kind = "write" as RenderOpKind;

  constructor(
    private table: Table,
    private index: number,
    private node: Node) { }

  perform(root: Element, timestamp: number): void {
    const element = this.table[this.index];
    if (!element) {
      throw new Error(`missing node at index ${this.index}`);
    }

    element.appendChild(this.node);
  }
}


/** Removes a node from the tree. */
class Remove implements RenderOp<Element> {
  kind = "write" as RenderOpKind;

  constructor(
    private table: Table,
    private index: number) { }

  perform(root: Element, timestamp: number): void {
    const element = this.table[this.index];
    if (!element) {
      throw new Error(`missing node at index ${this.index}`);
    }

    const parent = element.parentNode;
    if (!parent) {
      throw new Error(`node at index ${this.index} has no parent`);
    }

    parent.removeChild(element);
  }
}


/** Replaces a node in the tree. */
class Replace implements RenderOp<Element> {
  kind = "write" as RenderOpKind;

  constructor(
    private table: Table,
    private index: number,
    private node: Node) { }

  perform(root: Element, timestamp: number): void {
    const element = this.table[this.index];
    if (!element) {
      throw new Error(`missing node at index ${this.index}`);
    }

    const parent = element.parentNode;
    if (!parent) {
      return;
    }

    parent.replaceChild(this.node, element);
  }
}


/**
 * Renders vdom nodes under a dom element.
 *
 * @param root The root Element.
 */
export default class DomRenderer extends BatchRenderer {
  private previousNode: HtmlNode;

  render(node: HtmlNode): void {
    if (!this.previousNode) {
      this.push(new ReplaceRoot(toDom(node)));
      this.flush();
      this.previousNode = node;
      return;
    }

    const [indexes, patches] = diff(this.previousNode, node);

    let table = {};
    if (indexes.length) {
      this.flush();
      table = indexNodes(this.root);
    }

    for (const index of indexes) {
      const patch = patches[index];

      switch (patch.kind) {
        case "append":
          this.push(new Append(table, index, toDom(patch.node)));
          continue;
        case "remove":
          this.push(new Remove(table, index));
          continue;
        case "replace":
          this.push(new Replace(table, index, toDom(patch.node)));
          continue;
      }
    }

    this.previousNode = node;
  }
}


/**
 * Type of mappings from indexes (in depth-first order) to the
 * children of a Dom Node.
 */
type Table = { [key: number]: Node };

/**
 * Build a node Table by walking the tree depth-first from a root
 * element and assigning an index to each node along the way.
 */
function indexNodes(root: Element): Table {
  let index = 0;
  let table: Table = {};
  let node = root.firstChild;

  loop:
  while (node) {
    table[index++] = node;

    if (node.firstChild) {
      node = node.firstChild;
    } else if (node.nextSibling) {
      node = node.nextSibling;
    } else {
      let parent = node.parentElement;
      while (parent && parent !== root) {
        if (parent.nextSibling) {
          node = parent.nextSibling;
          continue loop;
        }

        parent = parent.parentElement;
      }

      break;
    }
  }

  return table;
}

/**
 * Converts HtmlNodes to Dom nodes.
 */
function toDom(node: HtmlNode): Element | Text {
  if (isElement(node)) {
    // TODO: Attributes
    const el = document.createElement(node.tag);
    for (const child of node.children) {
      el.appendChild(toDom(child));
    }

    return el;
  }

  return document.createTextNode(node.content);
}
