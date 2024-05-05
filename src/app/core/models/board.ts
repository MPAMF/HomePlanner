import {Drawable} from "./interfaces/drawable";
import {DrawState, isWallDrawState} from "./draw-state";
import {Point} from "./point";
import {BoardConfig} from "./board-config";
import {Clickable, ClickableState} from "./interfaces/clickable";
import {applyToCanvas, Canvas, clearCanvas, drawImage, DrawOn, getScale} from "./canvas";
import {afterNextRender} from "@angular/core";
import {Room} from "./room";
import {ActionsButtonOptions} from "./action-button-options";
import {Wall} from "./wall";
import {ClickablePoint} from "./clickable-point";

export class Board implements Drawable {
  public rooms: Room[];
  public drawState: DrawState;
  public mousePosition: Point;
  public isPanning: boolean; // Whether the user is panning the canvas (moving the canvas around)
  public isDragging: boolean; // Whether the user is dragging an element
  public draggingApplyFn?: (offset?: Point) => void;
  public currentRoom?: Room; // This room is the room that is currently being edited
  public actionsButtonOptions: ActionsButtonOptions = new ActionsButtonOptions();
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
   * @param isRightClick Is a right click
   */
  onClick(canvas: Canvas, point: Point, drawState: DrawState, isRightClick: boolean = false): Clickable | undefined {
    let clickedElement: Clickable | undefined;

    //Select element section
    switch (drawState){
      case DrawState.None:
        clickedElement = this.selectElementsOnCanvas(canvas, point, ClickableState.SELECTED, isRightClick);
        break;

      case DrawState.Window:
      case DrawState.Door:
        clickedElement =  this.findClosestWall(point);
        break;
    }

    return clickedElement;
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
   * This function reset the selected state and possibly select an element on the board
   * @param canvas The canvas
   * @param point The position of the mouse
   * @param state
   * @param isRightClick is a right click
   */
  selectElementsOnCanvas(canvas: Canvas, point: Point, state: ClickableState, isRightClick: boolean = false): Clickable | undefined {
    if (this.selectedElement && state == ClickableState.SELECTED
      || this.hoveredElement && state == ClickableState.HOVERED) {

      this.applyOnAllClickable(canvas, (clickable: Clickable): boolean => {
        const hasChange: boolean = clickable.resetState(state);
        clearCanvas(canvas.snappingLine);
        if (hasChange) {
          clickable.draw(canvas, DrawOn.Background);

          if(state == ClickableState.SELECTED) {
            this.actionsButtonOptions = new ActionsButtonOptions();
          }
        }

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

        if(state == ClickableState.SELECTED && isRightClick) {
          this.actionsButtonOptions = clickable.getActionsButtonOptions(point);
        }
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

    return element;
  }

  /**
   * Find the closest wall to the given point
   * @param point The point use to search the wall
   * @return the closest wall if a wall exist
   */
  public findClosestWall(point: Point): Wall | undefined {
    let nearestWall: Wall | undefined;
    let lastShortestDistance: number = -1;

    for (const room of this.rooms) {
      for (const wall of room.walls) {

        // Determine coordinate in the nearest Wall
        const pointInTheNearestWall: Point = wall.projectOrthogonallyOntoWall(point);

        // Check if the point is on the wall
        const p1xSupP2x: boolean = (pointInTheNearestWall.x >= wall.p2.x) && (pointInTheNearestWall.x <= wall.p1.x);
        const p2xSupP1x: boolean = (pointInTheNearestWall.x >= wall.p1.x) && (pointInTheNearestWall.x <= wall.p2.x);

        const p1ySupP2y: boolean = (pointInTheNearestWall.y >= wall.p2.y) && (pointInTheNearestWall.y <= wall.p1.y);
        const p2ySupP1y: boolean = (pointInTheNearestWall.y >= wall.p1.y) && (pointInTheNearestWall.y <= wall.p2.y);

        const isPointOnTheWall: boolean = (p1xSupP2x || p2xSupP1x) && (p1ySupP2y || p2ySupP1y);
        const newDistance: number = pointInTheNearestWall.distanceTo(point);
        if ((lastShortestDistance > newDistance || lastShortestDistance == -1)
          && isPointOnTheWall){
          lastShortestDistance = newDistance;
          nearestWall = wall;
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
    const pt = this.drawState === DrawState.WallCreation && lastWall ? lastWall.p2.point : this.mousePosition;
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

        if (this.selectedElement && this.hoveredElement) {
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

  /**
   * Normalise the points of the walls
   * This function is used to remove all duplicates points
   * and replace all references to the old points with the new ones
   * This function should be called after all the walls are added (room finalised)
   */
  public normalisePoints() {
    const points = this.rooms.map(room => room.walls.flatMap(w => [w.p1, w.p2])).flat();
    const uniquePoints: { [key: string]: ClickablePoint } = {};
    // remove all duplicates (in coordinates)
    points.forEach(p => uniquePoints[p.point.toString()] = p);
    // now that we have unique points, we can replace all references to the old points with the new ones
    this.rooms.forEach(room => room.walls.forEach(w => {
      w.p1 = uniquePoints[w.p1.point.toString()];
      w.p2 = uniquePoints[w.p2.point.toString()];
    }));
  }

  /**
   * Mark all the walls linked to the given point as finalized
   * @param point Point to mark the linked walls of
   * @param finalized Whether the walls should be marked as finalized or not
   */
  public markLinkedWalls(point: Point, finalized: boolean) {
    for (const room of this.rooms) {
      for (const wall of room.walls) {
        if (wall.p1.point.equals(point) || wall.p2.point.equals(point)) {
          wall.isFinalized = finalized;

          wall.elements?.forEach(element => {
            element.isFinalized = finalized;
          });
        }
      }
    }
  }

  /**
   * Get the walls linked to the given point
   * @param point Point to find the linked walls of
   */
  public getWallsLinkedToPoint(point: Point): Wall[] {
    return this.rooms.map(room => room.getWallsOnPoint(point)).flat();
  }

}
