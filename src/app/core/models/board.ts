import {Wall} from "./wall";
import {Drawable} from "./drawable";
import {DrawState} from "./draw-state";
import {Point} from "./point";
import {clearCanvas, drawImage, getScale} from "./canvas";
import {afterNextRender} from "@angular/core";
import {BoardConfig} from "./board-config";
import {Clickable} from "./clickable";

export class Board implements Drawable {
  public walls: Wall[];
  public drawState: DrawState;
  public isEditing: boolean;
  public mousePosition: Point;
  public isPanning: boolean;

  /**
   * Configs of the board
   */
  public boardConfig: BoardConfig;

  private image?: HTMLImageElement;

  constructor() {
    this.walls = [];
    this.drawState = DrawState.None; // defaults to none
    this.isEditing = false;
    this.isPanning = false;
    this.mousePosition = new Point(0, 0);
    this.boardConfig = new BoardConfig();

    afterNextRender(() => {
      this.image = new Image();
      this.image.src = "assets/svg/edit-pen.svg";
    });

  }

  draw(ctx: CanvasRenderingContext2D) {
    clearCanvas(ctx);
    this.drawCursor(ctx);
    this.walls.forEach(wall => wall.draw(ctx));
  }

  onClick(ctx: CanvasRenderingContext2D, point: Point): void {
    //Next to wall section
    this.applyOnAllClickable(ctx, (clickable: Clickable): boolean => {
      const hasChange: boolean = clickable.resetSelectedState();
      hasChange && clickable.draw(ctx);
      return true;
    });

    this.applyOnAllClickable(ctx, (clickable: Clickable) : boolean => {
      const isTheNearestWall = clickable.isPointOnElement(point);
      if(isTheNearestWall){
        clickable.isSelected = isTheNearestWall;
        this.draw(ctx);
      }

      return !isTheNearestWall;
    });
  }

  private drawCursor(ctx: CanvasRenderingContext2D) {
    ctx.canvas.style.cursor = this.findCursor();

    if (!this.isPanning && this.drawState === DrawState.Wall && this.image) {
      const lastWall = this.getLastWall();
      const pt =  this.isEditing && lastWall ? lastWall.p2 : this.mousePosition;
      drawImage(ctx, this.image, new Point(pt.x, pt.y - 30 / getScale(ctx).y), 30, 30);
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
        return "default";
    }
  }

  public getLastWall(): Wall | undefined {
    if (this.walls.length === 0) {
      return undefined;
    }
    return this.walls[this.walls.length - 1];
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

  public applyOnAllClickable(ctx: CanvasRenderingContext2D, fn: (clickable: Clickable) => boolean){
    for (const wall of this.walls) {
      const mustExecutionContinue: boolean = wall.applyOnAllClickable(ctx, fn)
      if(!mustExecutionContinue) return;
    }
  }
}
