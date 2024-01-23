import {Drawable} from "./drawable";
import {DrawState, isWallDrawState} from "./draw-state";
import {Point} from "./point";
import {BoardConfig} from "./board-config";
import {Clickable, ClickableSate} from "./clickable";
import {applyToCanvas, Canvas, clearCanvas, drawImage, DrawOn, getScale} from "./canvas";
import {afterNextRender} from "@angular/core";
import {Room} from "./room";

export class Board implements Drawable {
  public rooms: Room[];
  public drawState: DrawState;
  public mousePosition: Point;
  public isPanning: boolean; // Whether the user is panning the canvas (moving the canvas around)
  public currentRoom?: Room; // This room is the room that is currently being edited
  private image?: HTMLImageElement;
  private isAnClickableSelected: boolean = false;
  private isAnClickableHovered: boolean = false;
  constructor(
    public boardConfig: BoardConfig = new BoardConfig()
  ) {
    this.rooms = [];
    this.drawState = DrawState.None; // defaults to none
    this.isPanning = false;
    this.mousePosition = new Point(0, 0);

    afterNextRender(() => {
      this.image = new Image();
      this.image.src = "assets/png/pen.png";
    });

  }

  draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    // Clear the canvas
    switch (on) {
      case DrawOn.Background:
        clearCanvas(canvas.background);
        clearCanvas(canvas.snappingLine);
        break;
      case DrawOn.SnappingLine:
        clearCanvas(canvas.snappingLine);
        break;
      case DrawOn.All:
        applyToCanvas(canvas, ctx => clearCanvas(ctx));
        break;
      default:
        break;
    }

    // Cursor only on top of everything
    this.drawCursor(canvas.snappingLine);

    // Draw the current not finalized room
    this.currentRoom?.draw(canvas, on);

    // Draw all the rooms
    this.rooms.forEach(room => room.draw(canvas, on));
  }

  /**
   * Interaction to do on the board when the user click
   * @param canvas The canvas
   * @param point the position of the mouse
   */
  onClick(canvas: Canvas, point: Point): void {
    //Select element section
    this.selectElementsOnCanvas(canvas, point, ClickableSate.SELECTED);
  }

  /**
   * Interaction to do on the board when the user move
   * @param canvas The canvas
   * @param point the position of the mouse
   */
  onMove(canvas: Canvas, point: Point): void {
    //Select element section
    this.selectElementsOnCanvas(canvas, point, ClickableSate.HOVERED);
  }

  /**
   * This function reset the selected state and possibly select a element on the board
   * @param canvas The canvas
   * @param point The position of the mouse
   * @param clickableState
   */
  selectElementsOnCanvas(canvas: Canvas, point: Point, clickableState: ClickableSate): void {
    if (this.isAnClickableSelected && clickableState == ClickableSate.SELECTED
      || this.isAnClickableHovered && clickableState == ClickableSate.HOVERED) {

      this.applyOnAllClickable(canvas, (clickable: Clickable): boolean => {
        const hasChange: boolean = clickable.resetState(clickableState);
        hasChange && clickable.draw(canvas, DrawOn.Background);
        return true;
      });
    }

    const isElementSelected: boolean = this.applyOnAllClickable(canvas, (clickable: Clickable): boolean => {
      const isTheNearestElement = clickable.isPointOnElement(point);
      if (isTheNearestElement) {
        clickable.setState(clickableState);
        this.draw(canvas, DrawOn.Background);
      }

      return !isTheNearestElement;
    });

    switch (clickableState) {
      case ClickableSate.SELECTED:
        this.isAnClickableSelected = isElementSelected;
        break;

      case ClickableSate.HOVERED:
        this.isAnClickableHovered = isElementSelected;
        break;
    }
  }

  /**
   * Find the closest wall point to the given point
   * @param point Point to find the closest wall point to
   * @param maxDistance Maximum distance to search for a wall point
   * @param excludeLastWall Exclude the last wall from the search
   * @returns The closest wall point and whether the point is on the current room or not
   */
  public findClosestWallPoint(point: Point, maxDistance: number = -1, excludeLastWall: boolean = false): [Point, boolean] | undefined {
    let closestPoint: Point | undefined;
    let closestDistance = Number.MAX_SAFE_INTEGER;
    let isOnCurrentRoom = false;

    const tempRooms = this.currentRoom ? [...this.rooms, this.currentRoom] : this.rooms;

    for (let i = 0; i < tempRooms.length; i++) {

      const room = tempRooms[i];

      const closestWallPoint = tempRooms[i].findClosestWallPoint(point, maxDistance, excludeLastWall && room === this.currentRoom);

      if (!closestWallPoint) {
        continue;
      }

      const [pt, distance] = closestWallPoint;

      if (distance < closestDistance) {
        closestPoint = pt;
        closestDistance = distance;
        isOnCurrentRoom = room === this.currentRoom;
      }

    }

    return closestPoint ? [closestPoint, isOnCurrentRoom] : undefined;
  }

  public applyOnAllClickable(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean {
    for (const room of this.rooms) {
      const mustExecutionContinue: boolean = room.applyOnClickableRecursive(canvas, fn)
      if (!mustExecutionContinue) return true;
    }

    return false;
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
      case DrawState.WallCreation:
      case DrawState.Wall:
        return "none";
      case DrawState.Move:
        return "grab";
      default:
        return "default";
    }
  }
}
