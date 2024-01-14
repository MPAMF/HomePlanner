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

export class ZoomCommand extends Command {

  constructor(private pt: Point, private scaleFactor: number) {
    super();
  }

  override execute(): void {
    this.board.zoom(this.canvasCtx, this.pt, this.scaleFactor);
    // this.canvas.context.scale(this.scaleFactor, this.scaleFactor);
  }

  override undo(): void {
    this.board.zoom(this.canvasCtx, this.pt, -this.scaleFactor);
    // this.canvas.context.scale(1 / this.scaleFactor, 1 / this.scaleFactor);
  }
}

export class DeZoomCommand extends Command {

  constructor(private scaleFactor: number) {
    super();
  }

  override execute(): void {
    this.canvasCtx.scale(1 / this.scaleFactor, 1 / this.scaleFactor);
  }

  override undo(): void {
    this.canvasCtx.scale(this.scaleFactor, this.scaleFactor);
  }
}
