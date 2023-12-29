import {Wall} from "./wall";
import {Drawable} from "./drawable";

export class Board implements Drawable {
  public isDrawingWalls: boolean;
  public walls: Wall[];

  constructor() {
    this.isDrawingWalls = false;
    this.walls = [];
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.clear(ctx);
    this.walls.forEach(wall => wall.draw(ctx));
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
