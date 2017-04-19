type Push<T> = (x: T) => void;
type Emitter<T> = (push: Push<T>) => void;
type Subscriber<T> = (x: T) => void;


/**
 * Signals represent streams of values that vary over time.  Each
 * signal instance may have one or more subscribers at any time.
 *
 * Individual values are emitted to all current subscribers of a
 * signal.  If values on a Signal are emitted before any subscribers
 * exist, those values are enqueued until the first subscriber joins.
 * Previously-emitted values are not replayed to new subscribers.
 */
export class Signal<T> {
  protected subscribers: Subscriber<T>[] = [];
  protected queue: T[] = [];

  /**
   * Create a new signal for values of type `T`.
   */
  static create<T>(emitter: Emitter<T>): Signal<T> {
    const signal = new Signal<T>();
    emitter(signal.push.bind(signal));
    return signal;
  }

  /**
   * Create a new signal that emits a single value `x`.
   */
  static once<T>(x: T): Signal<T> {
    return Signal.create((push: Push<T>) => {
      push(x);
    });
  }

  /**
   * Merge multiple signals of the same type into one.
   */
  static merge<T>(...signals: Signal<T>[]): Signal<T> {
    return Signal.create((push: Push<T>) => {
      for (const signal of signals) {
        signal.subscribe(push);
      }
    });
  }

  protected drain(): void {
    while (true) {
      const item = this.queue.shift();
      if (item === undefined) break;

      this.push(item);
    }
  }

  protected push(x: T): void {
    if (!this.subscribers.length) {
      this.queue.push(x);
      return;
    }

    for (const subscriber of this.subscribers) {
      subscriber(x);
    }
  }

  map<U>(f: (x: T) => U): Signal<U> {
    return Signal.create((push: Push<U>) => {
      this.subscribe((x: T) => {
        push(f(x));
      });
    });
  }

  fold<S>(state: S, f: (s: S, x: T) => S): Signal<S> {
    return Signal.create((push: Push<S>) => {
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


/**
 * Mailboxes are abstractions over signals that you can send values
 * to, causing their underlying signals to emit those values later.
 */
export class Mailbox<T> {
  private push: Push<T>;

  /**
   * The underlying signal represented by this mailbox.  Values sent
   * to this mailbox will eventually be emitted by this signal.
   */
  public signal: Signal<T>;

  constructor() {
    this.signal = Signal.create((push: Push<T>) => {
      this.push = push;
    });
  }

  /**
   * Send a value to this mailbox, causing its underlying signal to
   * eventually emit that value.
   */
  send(x: T): void {
    this.push(x);
  }
}
