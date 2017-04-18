type Pusher<T> = (x: T) => void;
type Emitter<T> = (push: Pusher<T>) => void;
type Subscriber<T> = (x: T) => void;

export default class Signal<T> {
  private subscribers: Subscriber<T>[] = [];
  private queue: T[] = [];

  /** Create a new signal for values of type `T`. */
  static create<T>(emitter: Emitter<T>): Signal<T> {
    const signal = new Signal<T>();
    emitter(signal.push.bind(signal));
    return signal;
  }

  /** Create a new signal that emits a single value `x`. */
  static once<T>(x: T): Signal<T> {
    return Signal.create((push: Pusher<T>) => {
      push(x);
    });
  }

  /** Merge multiple signals of the same type into one. */
  static merge<T>(...signals: Signal<T>[]): Signal<T> {
    return Signal.create((push: Pusher<T>) => {
      for (const signal of signals) {
        signal.subscribe(push);
      }
    });
  }

  private drain(): void {
    while (this.queue.length) {
      const item = this.queue.shift();
      if (item === undefined) break;

      this.push(item);
    }
  }

  private push(x: T): void {
    if (!this.subscribers.length) {
      this.queue.push(x);
      return;
    }

    for (const subscriber of this.subscribers) {
      subscriber(x);
    }
  }

  map<U>(f: (x: T) => U): Signal<U> {
    return Signal.create((push: Pusher<U>) => {
      this.subscribe((x: T) => {
        push(f(x));
      });
    });
  }

  fold<S>(state: S, f: (s: S, x: T) => S): Signal<S> {
    return Signal.create((push: Pusher<S>) => {
      this.subscribe((x: T) => {
        state = f(state, x);
        push(state);
      });
    });
  }

  subscribe(f: (x: T) => void): void {
    this.subscribers.push(f);
    this.drain();
  }
}
