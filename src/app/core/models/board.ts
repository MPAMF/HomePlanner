import {Wall} from "./wall";
import {Drawable} from "./drawable";
import {DrawState} from "./draw-state";
import {Point} from "./point";

export class Board implements Drawable {
  public walls: Wall[];
  public drawState: DrawState;
  public isEditing: boolean;
  public offset: Point;

  constructor() {
    this.walls = [];
    this.drawState = DrawState.None; // defaults to none
    this.isEditing = false;
    this.offset = new Point(0, 0);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.clear(ctx);
    this.walls.forEach(wall => wall.draw(ctx, this.offset));
  }

  private clear(ctx: CanvasRenderingContext2D, preserveTransform: boolean = false) {
    if (preserveTransform) {
      ctx.save();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (preserveTransform) {
      ctx.restore();
    }
  }

}
