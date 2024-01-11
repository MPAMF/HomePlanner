import {Point} from "../models/point";
import {Wall} from "../models/wall";
import {DrawState} from "../models/draw-state";
import {AddWallCommand, EditLastWallWithPointCommand, FinaliseLastWallCommand} from "../commands/wall-commands";
import {CommandInvoker} from "../commands/command";
import {MoveElementCommand} from "../commands/canvas-commands";
import {BaseEvent} from "./base-event";

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
    if (!this.canvas) return;

    const mouseX = this.getMouseXPosition(event);
    const mouseY = this.getMouseYPosition(event);
    this.board.mousePosition = new Point(mouseX - this.board.offset.x, mouseY - this.board.offset.y);
    this.cmdInvoker.redraw();

    switch (this.board.drawState) {
      case DrawState.None:
        break;
      case DrawState.Wall:
        if (this.board.isEditing) {
          const pt = new Point(mouseX - this.board.offset.x, mouseY - this.board.offset.y);
          this.cmdInvoker.execute(new EditLastWallWithPointCommand(pt), false);
        }
        break;

      case DrawState.Move:
        if (this.board.isPanning && this.canvas) {
          const dx = event.clientX - this.panStart.x;
          const dy = event.clientY - this.panStart.y;
          this.panStart.x = event.clientX;
          this.panStart.y = event.clientY;

          this.cmdInvoker.execute(new MoveElementCommand(new Point(dx, dy)));
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
    if (!this.canvas) return;
    const startX = this.getMouseXPosition(event);
    const startY = this.getMouseYPosition(event);

    switch (this.board.drawState) {
      case DrawState.Wall:
        const pt = new Point(startX - this.board.offset.x, startY - this.board.offset.y);

        if (this.board.isEditing) {
          const closestPt = this.board.findClosestWallPoint(pt, 10, true);

          if (closestPt) {
            this.cmdInvoker.execute(new FinaliseLastWallCommand());
            return;
          }
        }

        let wall = new Wall(pt, pt, 2, 'black');
        this.cmdInvoker.execute(new AddWallCommand(wall));

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
  onMouseUp() {
    if (!this.canvas) return;

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

  private getMouseXPosition(event: MouseEvent): number {
    return (event.clientX - this.canvas.canvas.getBoundingClientRect().left) * (this.canvas.canvas.width / this.canvas.canvas.getBoundingClientRect().width);
  }

  private getMouseYPosition(event: MouseEvent): number {
    return (event.clientY - this.canvas.canvas.getBoundingClientRect().top) * (this.canvas.canvas.height / this.canvas.canvas.getBoundingClientRect().height);
  }

  override bind() {
    this.canvas.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));
  }

  override unbind() {
    this.canvas.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.canvas.removeEventListener('contextmenu', this.onContextMenu.bind(this));
  }
}


