import {Wall} from "./wall";
import {Drawable} from "./drawable";
import {DrawState} from "./draw-state";
import {Point} from "./point";
import {Canvas} from "./canvas";

export class Board implements Drawable {
  public walls: Wall[];
  public drawState: DrawState;
  public isEditing: boolean;
  public offset: Point;
  public isPanning: boolean;

  constructor() {
    this.walls = [];
    this.drawState = DrawState.None; // defaults to none
    this.isEditing = false;
    this.isPanning = false;
    this.offset = new Point(0, 0);
  }

  draw(canvas: Canvas) {
    this.clear(canvas.context);
    canvas.canvas.style.cursor = this.findCursor();

    this.walls.forEach(wall => wall.draw(canvas));
  }

  private findCursor(): string {
    switch (this.drawState) {
      case DrawState.Wall:
        return "crosshair";
      case DrawState.Move:
        return this.isPanning ? "grabbing" : "grab";
      default:
        return "pointer";
    }
  }

  private clear(ctx: CanvasRenderingContext2D, preserveTransform: boolean = false) {
    if (preserveTransform) {
      ctx.save();
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (preserveTransform) {
      ctx.restore();
    }
  }

  private reset(ctx: CanvasRenderingContext2D, preserveTransform: boolean = false) {
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
