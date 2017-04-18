import Signal from "./";

let _mouseMove: Signal<MouseEvent>;

/** Create a signal of mouse move events. */
export function MouseMove(): Signal<MouseEvent> {
  if (!_mouseMove) {
    _mouseMove = Signal.create((push: (x: MouseEvent) => void) => {
      window.addEventListener("mousemove", push);
    });
  }

  return _mouseMove;
}
