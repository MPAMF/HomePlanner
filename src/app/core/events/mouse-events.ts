import {Point} from "../models/point";
import {Wall} from "../models/wall";
import {DrawState} from "../models/draw-state";
import {AddWallCommand, EditLastWallWithPointCommand, FinaliseLastWallCommand,} from "../commands/wall-commands";
import {CommandInvoker} from "../commands/command";
import {DragObjectCommand, EndObjectDragCommand, MoveCommand, StartObjectDragCommand} from "../commands/canvas-commands";
import {BaseEvent} from "./base-event";
import {applyToCanvas, DrawOn, getScale, inverseTransformPoint, zoomCanvas} from "../models/canvas";

export class MouseEvents extends BaseEvent {
  private panStart: Point;
  private dragStart: Point;
  private readonly maxZoom: number;
  private readonly minZoom: number;

  constructor(cmdInvoker: CommandInvoker, actionCmdInvoker: CommandInvoker) {
    super(cmdInvoker, actionCmdInvoker);
    this.panStart = new Point(0, 0);
    this.dragStart = new Point(0, 0);
    this.maxZoom = 5;
    this.minZoom = 0.1;
  }

  /**
   * Method call went the user move the mouse over the canvas
   * @param event
   */
  onMouseMove(event: MouseEvent) {
    if (!this.canvas) return;

    const mouseX = this.getMouseXPosition(event);
    const mouseY = this.getMouseYPosition(event);
    const pt = this.board.mousePosition = inverseTransformPoint(this.canvas.background, new Point(mouseX, mouseY));

    if (this.board.isPanning) {
      const dx = event.clientX - this.panStart.x;
      const dy = event.clientY - this.panStart.y;
      this.panStart.x = event.clientX;
      this.panStart.y = event.clientY;

      this.cmdInvoker.execute(new MoveCommand(new Point(dx, dy)));//Right click
      return;
    }

    if (this.board.isDragging && this.board.selectedElement) {
      const dx = event.clientX - this.dragStart.x;
      const dy = event.clientY - this.dragStart.y;
      this.dragStart.x = event.clientX;
      this.dragStart.y = event.clientY;

      this.cmdInvoker.execute(new DragObjectCommand(new Point(dx, dy)), false);
      return;
    }

    switch (this.board.drawState) {
      case DrawState.None:
        this.board.onMove(this.canvas, pt);
        break;
      case DrawState.Wall:
        this.cmdInvoker.redraw(DrawOn.SnappingLine);
        break;
      case DrawState.WallCreation:
        this.cmdInvoker.execute(new EditLastWallWithPointCommand(pt), false);
        break;
      case DrawState.Window:
        break;

      case DrawState.Door:
        break;

      default:
        return;
    }
  }

  /**
   * Method call went the user press down the mouse on the canvas
   * @param event
   */
  onMouseDown(event: MouseEvent) {
    if (!this.canvas) return;
    const startX = this.getMouseXPosition(event);
    const startY = this.getMouseYPosition(event);
    let pt = inverseTransformPoint(this.canvas.background, new Point(startX, startY));

    /**
     * 0 = Left click
     * 1 = Middle click
     * 2 = Right click
     */
    if (this.board.drawState !== DrawState.WallCreation && event.button === 2) {
      this.board.isPanning = true;
      this.cmdInvoker.redraw(DrawOn.All);
      this.panStart.x = event.clientX;
      this.panStart.y = event.clientY;
      return;
    }

    switch (this.board.drawState) {
      case DrawState.Wall:
        this.cmdInvoker.execute(new AddWallCommand(new Wall(pt, pt, this.board.boardConfig.wallThickness,
          this.board.boardConfig.wallColor, this.board.boardConfig.selectWallColor)));
        break;
      case DrawState.WallCreation: {
        const closestPt = this.board.findClosestWallPoint(pt, 10, true);
        const hasAnyWalls = this.board.currentRoom && this.board.currentRoom.hasAnyWalls();

        if (closestPt) {
          const [pt, isCurrentRoom] = closestPt;

          const addWallCommand = new AddWallCommand(new Wall(pt, pt, this.board.boardConfig.wallThickness,
            this.board.boardConfig.wallColor, this.board.boardConfig.selectWallColor));

          if (isCurrentRoom && hasAnyWalls) {
            const firstWall = this.board.currentRoom!.walls[0];
            if (firstWall.p1.equals(pt) || firstWall.p2.equals(pt)) {
              this.cmdInvoker.execute(new FinaliseLastWallCommand());
              return;
            }

            this.cmdInvoker.execute(addWallCommand);
            return;
          }

          this.cmdInvoker.execute(addWallCommand);
          return
        }

        // To fix the distance between the wall paste with the angle help and the position of the mouse
        if (hasAnyWalls) {
          const len = this.board.currentRoom!.walls.length;
          const lastWall = this.board.currentRoom!.walls[len - 1];
          pt = lastWall.p2;
        }

        this.cmdInvoker.execute(new AddWallCommand(new Wall(pt, pt, this.board.boardConfig.wallThickness,
          this.board.boardConfig.wallColor, this.board.boardConfig.selectWallColor)));

        break;
      }

      case DrawState.Move:
        if (event.button === 0) { //Left click
          this.board.isPanning = true;
          this.cmdInvoker.redraw(DrawOn.All);
          this.panStart.x = event.clientX;
          this.panStart.y = event.clientY;
        }
        break;

      case DrawState.Window:
        break;

      case DrawState.Door:
        break;

      case DrawState.None:

        this.board.onClick(this.canvas, pt);

        if (event.button === 0 && this.board.selectedElement) {
          this.dragStart.x = event.clientX;
          this.dragStart.y = event.clientY;
          this.cmdInvoker.execute(new StartObjectDragCommand(/*pt*/));
        }

        break;

      default:
        return;
    }
  }

  /**
   * Method call went the user stop pressing the mouse on the canvas
   */
  onMouseUp(event: MouseEvent) {
    if (!this.canvas) return;

    if (event.button === 0 && this.board.isDragging) {
      this.cmdInvoker.execute(new EndObjectDragCommand());
      return;
    }

    if (this.board.isPanning) {
      this.board.isPanning = false;
      this.cmdInvoker.redraw(DrawOn.SnappingLine);
    }

    switch (this.board.drawState) {
      case DrawState.None:
        break;
      case DrawState.Wall:
        break;
      case DrawState.Move:
        break;
      case DrawState.Window:
        break;
      case DrawState.Door:
        break;
      default:
        return;
    }
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const pt = new Point(this.getMouseXPosition(event), this.getMouseYPosition(event));

    // Compute zoom factor.
    const wheel = event.deltaY / 120;
    const zoom = Math.pow(1 + Math.abs(wheel) / 2, wheel < 0 ? 1 : -1);
    const currentScale = getScale(this.canvas.background);
    if (currentScale.x * zoom < this.minZoom || currentScale.x * zoom > this.maxZoom) return;

    applyToCanvas(this.canvas, ctx => zoomCanvas(ctx, inverseTransformPoint(this.canvas.background, pt), zoom));
    this.board.mousePosition = inverseTransformPoint(this.canvas.background, pt);
    this.cmdInvoker.redraw(DrawOn.All);
  }

  onMouseOut(event: MouseEvent) {
    if (this.board.isPanning) {
      this.board.isPanning = false;
      this.cmdInvoker.redraw(DrawOn.SnappingLine);
    }
  }

  override bind() {
    this.canvas.snappingLine.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.snappingLine.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.snappingLine.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.snappingLine.canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));
    this.canvas.snappingLine.canvas.addEventListener('wheel', this.onWheel.bind(this));
    this.canvas.snappingLine.canvas.addEventListener('mouseout', this.onMouseOut.bind(this));
  }

  override unbind() {
    this.canvas.snappingLine.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.snappingLine.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.snappingLine.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.snappingLine.canvas.removeEventListener('contextmenu', this.onContextMenu.bind(this));
    this.canvas.snappingLine.canvas.removeEventListener('wheel', this.onWheel.bind(this));
    this.canvas.snappingLine.canvas.removeEventListener('mouseout', this.onMouseOut.bind(this));
  }

  private getMouseXPosition(event: MouseEvent): number {
    return event.clientX - this.canvas.background.canvas.getBoundingClientRect().left;
  }

  private getMouseYPosition(event: MouseEvent): number {
    return event.clientY - this.canvas.background.canvas.getBoundingClientRect().top;
  }

  private setMousePosition(event: MouseEvent) {
    const pt = new Point(event.clientX, event.clientY);
    this.board.mousePosition = inverseTransformPoint(this.canvas.background, pt);
  }
}


