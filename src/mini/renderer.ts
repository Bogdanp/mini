/**
 * Type representing the kinds of render operations available.
 */
export type RenderOpKind = "read" | "write";


/**
 * Type of render operations.  Renderers may batch reads and writes
 * separately for performance.  Operations may be used to perform
 * performant animations.
 */
export interface RenderOp<T> {
  kind: RenderOpKind;
  perform(root: T, timestamp?: number): void;
}


/**
 * Type of renderers.
 */
export interface Renderer<T> {
  /**
   * The Node (usually a DOM Element) into which the tree is rendered.
   */
  root: T;

  /**
   * Start the renderer if it isn't already running.
   */
  start(): void;

  /**
   * Stop the renderer if it is running.  Does nothing otherwise.
   */
  stop(): void;

  /**
   * Push a rendering operation onto the queue to be performed.
   * Depending on the implementation, operations may be performed
   * later.
   *
   * @param op The operation to enqueue.
   */
  push(op: RenderOp<T>): void;

  /**
   * Perform a full render immediately.
   */
  flush(): void;
}


/**
 * A renderer that batches RenderOps together for efficient DOM
 * manipulation.
 *
 * @param root The Element into which to render.
 * @param deadline How many millis to allow each batch to run for.
 */
export default class BatchRenderer implements Renderer<Element> {
  private reads: RenderOp<Element>[] = [];
  private writes: RenderOp<Element>[] = [];
  private running = false;
  private nextFrame: number;

  constructor(
    public root: Element,
    protected deadline: number = 8) {

    this.start();
  }

  public push(op: RenderOp<Element>): void {
    switch (op.kind) {
      case "read":
        this.reads.push(op);
        return;
      case "write":
        this.writes.push(op);
        return;
    }
  }

  public start(): void {
    if (!this.running) {
      this.running = true;
      this.step();
    }
  }

  public stop(): void {
    this.running = false;

    if (this.nextFrame) {
      window.cancelAnimationFrame(this.nextFrame);
    }
  }

  public flush(): void {
    if (this.nextFrame) {
      window.cancelAnimationFrame(this.nextFrame);
    }

    this.step(undefined, true);
  }

  private step = (timestamp?: number, drain?: boolean): void => {
    if (!this.running) {
      return;
    }

    let currentTime, startTime;
    currentTime = startTime = Date.now();
    while (drain || currentTime - startTime < this.deadline) {
      const operation = this.reads.shift();
      if (operation === undefined) break;

      operation.perform(this.root, timestamp);
      currentTime = Date.now();
    }

    while (drain || currentTime - startTime < this.deadline) {
      const operation = this.writes.shift();
      if (operation === undefined) break;

      operation.perform(this.root, timestamp);
      currentTime = Date.now();
    }

    this.nextFrame = window.requestAnimationFrame(this.step);
  }
}
