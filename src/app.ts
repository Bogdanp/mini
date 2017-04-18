import Signal from "./mini/signal";
import { MouseMove } from "./mini/signal/mouse";
import * as Every from "./mini/signal/every";

import { HtmlNode, div, h1, h6, text } from "./mini/vdom";
import DomRenderer from "./mini/vdom/renderer";

interface State {
  currentTime: Date;
  x: number;
  y: number;
}

interface NoOp { kind: "noop"; }
interface Tick { kind: "tick"; date: Date; }
interface Move { kind: "move"; x: number; y: number; }

type Action = NoOp | Tick | Move;

const DEBUG = true;
const initialState = { currentTime: new Date, x: 0, y: 0 };

function update(state: State, action: Action): State {
  if (DEBUG) {
    console.debug("Update called with ", action.kind);
    console.debug("state = ", state);
    console.debug("action = ", action);
    console.debug("====================");
  }

  if (action.kind === "noop") {
    return state;
  } else if (action.kind === "tick") {
    return { ...state, currentTime: action.date };
  } else if (action.kind === "move") {
    return { ...state, ...action };
  } else {
    const _x: never = action;
  }

  console.error("Unhandled action during update: ", action);
  return state;
}

function view(state: State): HtmlNode {
  let children;

  if (Math.round(state.currentTime.getTime() / 1000) % 2 === 0) {
    children = [
      div(h1(text("e")), h1(text("v"))),
      div(h1(text("e"))),
      div(h1(text("n"))),
    ];
  } else {
    children = [
      div(h1(text("o")), h1(text("d"))),
      div(h1(text("d"))),
    ];
  }

  return div(
    h1(text("Hello, world!")),
    h1(text(`${state.x}, ${state.y} at ${state.currentTime}`)),
    div({}, ...children),
    div(h6(text("Hi!!!")))
  );
}


const root = document.getElementById("app");
if (!root) throw new Error("app element not found");

const renderer = new DomRenderer(root);
const signal = Signal.merge(
  Signal.once<Action>({ kind: "noop" }),
  Every.Second().map<Action>(t => ({ kind: "tick", date: new Date(t) })),
  MouseMove().map<Action>(e => ({ kind: "move", x: e.x, y: e.y })),
);

signal
  .fold<State>(initialState, update)
  .map(view)
  .subscribe((node) => renderer.render(node));
