import Signal from "./";

let _memo: { [key: number]: Signal<number> } = {};

function mkEvery(n: number): Signal<number> {
  let signal = _memo[n];
  if (!signal) {
    signal = _memo[n] = Every(n);
  }

  return signal;
}


/**
 * Returns a Signal that emits a timestamp every `n` milliseconds.
 */
export function Every(n: number): Signal<number> {
  return Signal.create((push: (x: number) => void) => {
    const schedule = function(now?: number) {
      now = now || Date.now();

      window.setTimeout(() => {
        const now = Date.now();

        push(now);
        schedule(now);
      }, n - now % n);
    };

    schedule();
  });
}


/**
 * Returns a Signal that emits a timestamp every second.
 */
export function Second(): Signal<number> {
  return mkEvery(1000);
}


/**
 * Returns a Signal that emits a timestamp every minute.
 */
export function Minute(): Signal<number> {
  return mkEvery(60000);
}


/**
 * Returns a Signal that emits a timestamp every hour.
 */
export function Hour(): Signal<number> {
  return mkEvery(3600000);
}
