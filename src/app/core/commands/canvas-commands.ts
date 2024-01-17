import {Command} from "./command";
import {Point} from "../models/point";
import {moveCanvas} from "../models/canvas";

export class MoveCommand extends Command {
  constructor(private delta: Point) {
    super();
  }

  override execute(): void {
    moveCanvas(this.canvasCtx, this.delta);
  }

  override undo(): void {
    moveCanvas(this.canvasCtx, new Point(-this.delta.x, -this.delta.y));
  }
}
