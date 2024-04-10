import {Drawable} from "./interfaces/drawable";
import {DrawState, isWallDrawState} from "./draw-state";
import {Point} from "./point";
import {BoardConfig} from "./board-config";
import {Clickable, ClickableState} from "./interfaces/clickable";
import {applyToCanvas, Canvas, clearCanvas, drawImage, DrawOn, getScale} from "./canvas";
import {afterNextRender} from "@angular/core";
import {Room} from "./room";
import {Wall} from "./wall";

export class Board implements Drawable {
  public rooms: Room[];
  public drawState: DrawState;
  public mousePosition: Point;
  public isPanning: boolean; // Whether the user is panning the canvas (moving the canvas around)
  public isDragging: boolean; // Whether the user is dragging an element
  public draggingApplyFn?: () => void;
  public currentRoom?: Room; // This room is the room that is currently being edited
  private image?: HTMLImageElement;
  public selectedElement?: Clickable;
  public hoveredElement?: Clickable;

  constructor(
    public boardConfig: BoardConfig = new BoardConfig()
  ) {
    this.rooms = [];
    this.drawState = DrawState.None; // defaults to none
    this.isPanning = false;
    this.isDragging = false;
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
   * @param drawState The draw state
   */
  onClick(canvas: Canvas, point: Point, drawState: DrawState): Wall | undefined {
    let nearestWall: Wall | undefined;

    //Select element section
    switch (drawState){
      case DrawState.None:
        this.selectElementsOnCanvas(canvas, point, ClickableState.SELECTED);
        break;

      case DrawState.Window:
        nearestWall =  this.findClosestWall(point);
        nearestWall?.setColor('#FF5733');
        break;
    }

    return nearestWall;
  }

  /**
   * Interaction to do on the board when the user move
   * @param canvas The canvas
   * @param point the position of the mouse
   */
  onMove(canvas: Canvas, point: Point): void {
    //Select element section
    this.selectElementsOnCanvas(canvas, point, ClickableState.HOVERED);
  }

  /**
   * This function reset the selected state and possibly select a element on the board
   * @param canvas The canvas
   * @param point The position of the mouse
   * @param state
   */
  selectElementsOnCanvas(canvas: Canvas, point: Point, state: ClickableState): void {
    if (this.selectedElement && state == ClickableState.SELECTED
      || this.hoveredElement && state == ClickableState.HOVERED) {

      this.applyOnAllClickable(canvas, (clickable: Clickable): boolean => {
        const hasChange: boolean = clickable.resetState(state);
        hasChange && clickable.draw(canvas, DrawOn.Background);
        return true;
      });
    }

    let element: Clickable | undefined = undefined

    this.applyOnAllClickable(canvas, (clickable: Clickable): boolean => {
      const isOnElement = clickable.isPointOnElement(point);
      if (isOnElement) {
        clickable.setState(state);
        clearCanvas(canvas.snappingLine);
        clickable.draw(canvas, DrawOn.All);
        element = clickable;
      }

      return !isOnElement;
    });

    switch (state) {
      case ClickableState.SELECTED:
        this.selectedElement = element;
        break;

      case ClickableState.HOVERED:
        this.hoveredElement = element;
        break;
    }

    // update cursor
    this.drawCursor(canvas.snappingLine);

  }

  public findClosestWall(point: Point): Wall | undefined {
    let nearestWall: Wall | undefined;
    let lastShortestDistance: number = -1;
    let index: number;

    for (const room of this.rooms) {
      index = 0;
      for (const wall of room.walls) {
        index++;
        console.log(`wall ${index} : (${wall.p1.x}, ${wall.p1.y}) (${wall.p2.x}, ${wall.p2.y})`)
        console.log(`point : (${point.x}, ${point.y})`)

        const p1xSupP2x: boolean = (point.x >= wall.p2.x) && (point.x <= wall.p1.x);
        const p2xSupP1x: boolean = (point.x >= wall.p1.x) && (point.x <= wall.p2.x);

        const p1ySupP2y: boolean = (point.y >= wall.p2.y) && (point.y <= wall.p1.y);
        const p2ySupP1y: boolean = (point.y >= wall.p1.y) && (point.y <= wall.p2.y);

        if( (p1xSupP2x || p2xSupP1x) && (p1ySupP2y || p2ySupP1y)){

          const proportion: number = (point.x - wall.p1.x) / (wall.p2.x - wall.p1.x);
          const pointInTheNearestWall: Point = new Point( point.x, wall.p1.y + proportion * (wall.p2.y - wall.p1.y));

          const newDistance: number = pointInTheNearestWall.distanceTo(point);

          if (lastShortestDistance > newDistance || lastShortestDistance == -1){
            lastShortestDistance = newDistance;
            nearestWall = wall;
            console.log('true')
          }
        }
      }
    }

    return nearestWall;
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

  /**
   * Find the cursor to display
   * @returns The cursor to display
   */
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

        if (this.hoveredElement && this.hoveredElement instanceof Wall) {
          return "move";
        }

        if (this.selectedElement) {
          return "move";
        }

        return "default";
    }
  }

  /**
   * Get the room that contains the given wall
   * @param wall Wall to find the room of
   * @returns The room that contains the given wall
   */
  public getRoomByWall(wall: Wall): Room | undefined {
    return this.rooms.find(room => room.walls.includes(wall));
  }

}
