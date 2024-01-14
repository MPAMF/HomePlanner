import {Point} from "../models/point";
import {Wall} from "../models/wall";
import {DrawState} from "../models/draw-state";
import {AddWallCommand, EditLastWallWithPointCommand, FinaliseLastWallCommand} from "../commands/wall-commands";
import {CommandInvoker} from "../commands/command";
import {MoveCommand, ZoomCommand} from "../commands/canvas-commands";
import {BaseEvent} from "./base-event";
import {inverseTransformPoint, transformPoint} from "../models/canvas";

export class MouseEvents extends BaseEvent {
  private panStart: Point;

  constructor(cmdInvoker: CommandInvoker) {
    super(cmdInvoker);
    this.panStart = new Point(0, 0);
  }

  /**
   * Method call went the user move the mouse over the canvas
   * @param event
   */
  onMouseMove(event: MouseEvent) {
    if (!this.canvasCtx) return;

    const mouseX = this.getMouseXPosition(event);
    const mouseY = this.getMouseYPosition(event);
    const pt = this.board.mousePosition = inverseTransformPoint(this.canvasCtx, new Point(mouseX, mouseY));
    this.board.mousePosition = pt;
    this.cmdInvoker.redraw();

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
        if (this.board.isEditing) {
          this.cmdInvoker.execute(new EditLastWallWithPointCommand(pt), false);
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
   * Method call went the user press down the mouse on the canvas
   * @param event
   */
  onMouseDown(event: MouseEvent) {
    if (!this.canvasCtx) return;
    const startX = this.getMouseXPosition(event);
    const startY = this.getMouseYPosition(event);
    const pt = new Point(startX, startY);

    /**
     * 0 = Left click
     * 1 = Middle click
     * 2 = Right click
     */
    if (event.button === 2) { //Left click
      this.board.isPanning = true;
      this.cmdInvoker.redraw();
      this.panStart.x = event.clientX;
      this.panStart.y = event.clientY;
      return;
    }

    switch (this.board.drawState) {
      case DrawState.Wall:

        if (this.board.isEditing) {
          const closestPt = this.board.findClosestWallPoint(pt, 10, true);

          if (closestPt) {
            this.cmdInvoker.execute(new FinaliseLastWallCommand());
            return;
          }
        }

        this.cmdInvoker.execute(new AddWallCommand(new Wall(pt, pt, 2, 'black')));

        break;

      case DrawState.Move:
        if (event.button === 0) { //Left click
          this.board.isPanning = true;
          this.cmdInvoker.redraw();
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
    if (!this.canvasCtx) return;

    if (this.board.isPanning) {
      this.board.isPanning = false;
      this.cmdInvoker.redraw();
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
    const mousex = this.getMouseXPosition(event);
    const mousey = this.getMouseYPosition(event);

    // Compute zoom factor.
    const wheel = event.deltaY / 120;
    const zoom = Math.pow(1 + Math.abs(wheel) / 2, wheel > 0 ? 1 : -1);
    this.cmdInvoker.execute(new ZoomCommand(new Point(mousex, mousey), zoom));
  }

  private getMouseXPosition(event: MouseEvent): number {
    return (event.clientX - this.canvasCtx.canvas.getBoundingClientRect().left) * (this.canvasCtx.canvas.width / this.canvasCtx.canvas.getBoundingClientRect().width);
  }

  private getMouseYPosition(event: MouseEvent): number {
    return (event.clientY - this.canvasCtx.canvas.getBoundingClientRect().top) * (this.canvasCtx.canvas.height / this.canvasCtx.canvas.getBoundingClientRect().height);
  }

  override bind() {
    this.canvasCtx.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvasCtx.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvasCtx.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvasCtx.canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));
    this.canvasCtx.canvas.addEventListener('wheel', this.onWheel.bind(this));
  }

  override unbind() {
    this.canvasCtx.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvasCtx.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvasCtx.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvasCtx.canvas.removeEventListener('contextmenu', this.onContextMenu.bind(this));
    this.canvasCtx.canvas.removeEventListener('wheel', this.onWheel.bind(this));
  }
}


