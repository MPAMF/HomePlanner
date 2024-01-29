import {Command} from "./command";
import {Point} from "../models/point";
import {applyToCanvas, moveCanvas} from "../models/canvas";
import {DrawState} from "../models/draw-state";
import {Room} from "../models/room";

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

export class ResetCurrentRoom extends Command {

  constructor(private currentRoom: Room | undefined) {
    super();
  }

  override execute(): void {
    this.board.currentRoom = undefined;
    this.board.drawState = DrawState.None;
  }

  override undo(): void {
    if (!this.currentRoom) {
      return;
    }
    this.board.currentRoom = this.currentRoom;
    this.board.drawState = DrawState.WallCreation;
  }
}
