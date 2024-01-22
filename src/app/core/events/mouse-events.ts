import {Point} from "../models/point";
import {Wall} from "../models/wall";
import {DrawState} from "../models/draw-state";
import {AddWallCommand, EditLastWallWithPointCommand, FinaliseLastWallCommand} from "../commands/wall-commands";
import {CommandInvoker} from "../commands/command";
import {MoveCommand} from "../commands/canvas-commands";
import {BaseEvent} from "./base-event";
import {applyToCanvas, DrawOn, getScale, inverseTransformPoint, zoomCanvas} from "../models/canvas";

export class MouseEvents extends BaseEvent {
  private panStart: Point;
  private readonly maxZoom: number;
  private readonly minZoom: number;

  constructor(cmdInvoker: CommandInvoker) {
    super(cmdInvoker);
    this.panStart = new Point(0, 0);
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

    switch (this.board.drawState) {
      case DrawState.None:
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
    const pt = inverseTransformPoint(this.canvas.background, new Point(startX, startY));

    /**
     * 0 = Left click
     * 1 = Middle click
     * 2 = Right click
     */
    if (this.board.drawState !== DrawState.WallCreation && event.button === 2) { //Left click
      this.board.isPanning = true;
      this.cmdInvoker.redraw(DrawOn.All);
      this.panStart.x = event.clientX;
      this.panStart.y = event.clientY;
      return;
    }

    switch (this.board.drawState) {
      case DrawState.Wall:
        this.cmdInvoker.execute(new AddWallCommand(new Wall(pt, pt, 2, 'black')));
        break;
      case DrawState.WallCreation: {
        const closestPt = this.board.findClosestWallPoint(pt, 10, true);

        if (closestPt) {
          const [pt, isCurrentRoom] = closestPt;
          if (isCurrentRoom) {
            this.cmdInvoker.execute(new FinaliseLastWallCommand());
            return;
          }

          this.cmdInvoker.execute(new AddWallCommand(new Wall(pt, pt, 2, 'black')));
          return
        }

        this.cmdInvoker.execute(new AddWallCommand(new Wall(pt, pt, 2, 'black')));
      }
      break;

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

      default:
        return;
    }
  }

  /**
   * Method call went the user stop pressing the mouse on the canvas
   */
  onMouseUp(event: MouseEvent) {
    if (!this.canvas) return;

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
}


