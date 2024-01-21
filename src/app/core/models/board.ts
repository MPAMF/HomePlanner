import {Drawable} from "./drawable";
import {DrawState, isWallDrawState} from "./draw-state";
import {Point} from "./point";
import {applyToCanvas, Canvas, clearCanvas, drawImage, DrawOn, getScale} from "./canvas";
import {afterNextRender} from "@angular/core";
import {Room} from "./room";

export class Board implements Drawable {
  public rooms: Room[];
  public drawState: DrawState;
  public mousePosition: Point;
  public isPanning: boolean; // Whether the user is panning the canvas (moving the canvas around)
  private image?: HTMLImageElement;
  public currentRoom?: Room; // This room is the room that is currently being edited

  constructor() {
    this.rooms = [];
    this.drawState = DrawState.None; // defaults to none
    this.isPanning = false;
    this.mousePosition = new Point(0, 0);

    afterNextRender(() => {
      this.image = new Image();
      this.image.src = "assets/svg/edit-pen.svg";
    });

  }

  draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    // Clear the canvas
    switch (on) {
      case DrawOn.Background:
        clearCanvas(canvas.background);
        break;
      case DrawOn.SnappingLine:
        clearCanvas(canvas.snappingLine);
        break;
      default:
        applyToCanvas(canvas, ctx => clearCanvas(ctx));
        break;
    }

    // Cursor only on top of everything
    this.drawCursor(canvas.snappingLine);

    this.rooms.forEach(room => room.draw(canvas, on));
  }

  private drawCursor(ctx: CanvasRenderingContext2D) {
    ctx.canvas.style.cursor = this.findCursor();

    // Return if the user is panning or if there is no image
    if (this.isPanning || !this.image || !isWallDrawState(this.drawState)) {
      return;
    }

    const lastWall = this.currentRoom ? this.currentRoom.getLastWall() : undefined;
    const pt = this.drawState === DrawState.WallCreation && lastWall ? lastWall.p2 : this.mousePosition;
    drawImage(ctx, this.image, new Point(pt.x, pt.y - 30 / getScale(ctx).y), 30, 30);
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

  public findClosestWallPoint(point: Point, maxDistance: number = -1, excludeLastWall: boolean = false): Point | undefined {
    let closestPoint: Point | undefined;
    let closestDistance = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < this.rooms.length; i++) {

      const room = this.rooms[i];

      const closestWallPoint = this.rooms[i].findClosestWallPoint(point, maxDistance, excludeLastWall && room === this.currentRoom);

      if (!closestWallPoint) {
        continue;
      }

      const [pt, distance] = closestWallPoint;

      if (distance < closestDistance) {
        closestPoint = pt;
        closestDistance = distance;
      }

    }

    return closestPoint;
  }

}
