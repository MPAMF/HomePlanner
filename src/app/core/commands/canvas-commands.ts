import {Command} from "./command";
import {Point} from "../models/point";
import {applyToCanvas, moveCanvas} from "../models/canvas";

export class MoveCommand extends Command {
  constructor(private delta: Point) {
    super();
  }

  override execute(): void {
    applyToCanvas(this.canvas, (ctx) => moveCanvas(ctx, this.delta));
  }

  override undo(): void {
    applyToCanvas(this.canvas, (ctx) => moveCanvas(ctx, new Point(-this.delta.x, -this.delta.y)));
  }
}
