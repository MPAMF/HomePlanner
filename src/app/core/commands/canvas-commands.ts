import {Command} from "./command";
import {Point} from "../models/point";

export class MoveElementCommand extends Command {

  constructor(private delta: Point) {
    super();
  }

  override execute(): void {
    this.board.offset.x += this.delta.x;
    this.board.offset.y += this.delta.y;
  }

  override undo(): void {
    this.board.offset.x -= this.delta.x;
    this.board.offset.y -= this.delta.y;
  }
}

export class ZoomCommand extends Command {

  constructor(private scaleFactor: number) {
    super();
  }

  override execute(): void {
    this.canvas.context.scale(this.scaleFactor, this.scaleFactor);
  }

  override undo(): void {
    this.canvas.context.scale(1 / this.scaleFactor, 1 / this.scaleFactor);
  }
}

export class DeZoomCommand extends Command {

  constructor(private scaleFactor: number) {
    super();
  }

  override execute(): void {
    this.canvas.context.scale(1 / this.scaleFactor, 1 / this.scaleFactor);
  }

  override undo(): void {
    this.canvas.context.scale(this.scaleFactor, this.scaleFactor);
  }
}
