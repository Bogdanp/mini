import { Mailbox, Signal } from "./mini/signal";
import * as vdom from "./mini/vdom";
import DomRenderer from "./mini/vdom/renderer";

interface State {
  count: number;
}

interface NoOp { kind: "noop"; }
interface Incr { kind: "incr"; }
interface Decr { kind: "decr"; }

type Action = NoOp | Incr | Decr;

function update(state: State, action: Action): State {
  if (!PRODUCTION) {
    console.debug("Update called with", action.kind);
    console.debug("state =", state);
    console.debug("action =", action);
    console.debug("====================");
  }

  if (action.kind === "noop") {
    return state;

  } else if (action.kind === "incr") {
    return { count: state.count + 1 };

  } else if (action.kind === "decr") {
    return { count: state.count - 1 };

  } else {
    // This makes the ts compiler perform an exhaustiveness check on
    // Actions.  If we add an unhandled type to the Action ADT, the
    // compiler will complain.  Ugly but effective.
    const _x: never = action;
    return state;
  }
}

function view(state: State): vdom.HtmlNode {
  return vdom.div(
    vdom.button({ onclick: (_) => clicks.send({ kind: "decr" }) }, vdom.text("-")),
    vdom.text(String(state.count)),
    vdom.button({ onclick: (_) => clicks.send({ kind: "incr" }) }, vdom.text("+")),
  );
}


const root = document.getElementById("app");
if (!root) throw new Error("app element not found");

const initialState = { count: 0 };
const renderer = new DomRenderer(root);
const clicks = new Mailbox<Action>();
const signal = Signal.merge(
  Signal.once<Action>({ kind: "noop" }),
  clicks.signal,
);

signal
  .fold<State>(initialState, update)
  .map(view)
  .subscribe((node) => renderer.render(node));
