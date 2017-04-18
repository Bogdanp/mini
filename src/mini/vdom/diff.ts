import { HtmlElement, HtmlText, HtmlNode, isElement, isText } from "./";

interface Append {
  kind: "append";
  node: HtmlNode;
}

interface Replace {
  kind: "replace";
  node: HtmlNode;
}

interface Remove {
  kind: "remove";
}

type Patch = Append | Remove | Replace;
type Patches = { [key: number]: Patch };

function walk(a: HtmlNode, b: HtmlNode, patches: Patches, index: number = 0, parent?: number): number {
  if (a === b) {
    return index;
  }

  if (!a) {
    const patch = { kind: "append", node: b } as Patch;

    if (parent) {
      patches[parent] = patch;
    } else {
      patches[index] = patch;
    }

  } else if (!b) {
    patches[index] = { kind: "remove" };

  } else if (isText(a) && isElement(b) || isElement(a) && isText(b)) {
    patches[index] = { kind: "replace", node: b };

  } else if (isText(a) && isText(b)) {
    const textA = <HtmlText>a;
    const textB = <HtmlText>b;

    if (textA.content !== textB.content) {
      patches[index] = { kind: "replace", node: b };
    }

  } else {
    const elementA = <HtmlElement>a;
    const elementB = <HtmlElement>b;
    const children = Math.max(elementA.children.length, elementB.children.length);
    const parentIndex = index;

    for (let i = 0; i < children; i++) {
      const childA = elementA.children[i];
      const childB = elementB.children[i];

      index = walk(childA, childB, patches, ++index, parentIndex);
    }
  }

  return index;
}


/**
 * Compute the set of patches that must be applied in order to
 * transform node `a` into node `b`.
 *
 * Returns a tuple representing the sorted set of node indexes that
 * need to be patched as well as a mapping from those indexes to
 * individual patches.
 *
 * @param a The source node.
 * @param b The target node.
 */
export default function diff(a: HtmlNode, b: HtmlNode): [number[], Patches] {
  const indexes = [];
  const patches: Patches = {};
  const max = walk(a, b, patches);

  // TODO: Assuming this is faster than getting the keys, converting
  // them to numbers then sorting.
  for (let i = 0; i <= max; i++) {
    if (i in patches) {
      indexes.push(i);
    }
  }

  return [indexes, patches];
}
