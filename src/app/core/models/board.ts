import {Wall} from "./wall";
import {Drawable} from "./drawable";
import {DrawState} from "./draw-state";
import {Point} from "./point";
import {Canvas} from "./canvas";
import {afterNextRender} from "@angular/core";

export class Board implements Drawable {
  public walls: Wall[];
  public drawState: DrawState;
  public isEditing: boolean;
  public offset: Point;
  public mousePosition: Point;
  public isPanning: boolean;
  private image?: HTMLImageElement;

  constructor() {
    this.walls = [];
    this.drawState = DrawState.None; // defaults to none
    this.isEditing = false;
    this.isPanning = false;
    this.offset = new Point(0, 0);
    this.mousePosition = new Point(0, 0);

    afterNextRender(() => {
      this.image = new Image();
      this.image.src = "assets/svg/edit-pen.svg";
    });

  }

  draw(canvas: Canvas) {
    this.clear(canvas.context);
    this.drawCursor(canvas);
    this.walls.forEach(wall => wall.draw(canvas));
  }

  private drawCursor(canvas: Canvas) {
    canvas.canvas.style.cursor = this.findCursor();

    if (!this.isPanning && this.drawState === DrawState.Wall && this.image) {
      const lastWall = this.getLastWall();

      if (this.isEditing && lastWall) {
        const pt = this.normalisePoint(lastWall.p2);
        canvas.context.drawImage(this.image, pt.x, pt.y - 30, 30, 30);
      } else {
        canvas.context.drawImage(this.image, this.mousePosition.x, this.mousePosition.y - 30, 30, 30);
      }
    }
  }

  private findCursor(): string {
    if (this.isPanning) {
      return "grabbing";
    }
    switch (this.drawState) {
      case DrawState.Wall:
        return "none";
      case DrawState.Move:
        return "grab";
      default:
        return "cursor";
    }
  }

  public getLastWall(): Wall | undefined {
    if (this.walls.length === 0) {
      return undefined;
    }
    return this.walls[this.walls.length - 1];
  }

  public getRelativePoint(point: Point): Point {
    return new Point(point.x - this.offset.x, point.y - this.offset.y);
  }

  public normalisePoint(point: Point): Point {
    return new Point(point.x + this.offset.x, point.y + this.offset.y);
  }

  public findClosestWallPoint(point: Point, maxDistance: number = -1, excludeLastWall: boolean = false): Point | undefined {
    let closestPoint: Point | undefined;
    let closestDistance = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < this.walls.length; i++) {
      if (excludeLastWall && i === this.walls.length - 1) {
        continue;
      }
      const wall = this.walls[i];
      let pt: Point;
      let distance: number;
      const p1Distance = wall.p1.distanceTo(point);
      const p2Distance = wall.p2.distanceTo(point);

      if (p1Distance < p2Distance) {
        pt = wall.p1;
        distance = p1Distance;
      } else {
        pt = wall.p2;
        distance = p2Distance;
      }

      if (maxDistance > 0 && distance > maxDistance) {
        continue;
      }

      if (distance < closestDistance) {
        closestPoint = pt;
        closestDistance = distance;
      }
    }

    return closestPoint;
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
