import {Point} from "../models/point";
import {Wall} from "../models/wall";
import {DrawState} from "../models/draw-state";
import {AddWallCommand, EditLastWallWithPointCommand} from "../commands/wall-commands";
import {Board} from "../models/board";
import {CommandInvoker} from "../commands/command";
import {MoveElementCommand} from "../commands/canvas-commands";
import {BaseEvent} from "./base-event";

export interface MouseDownEvent {
  canvas?: HTMLCanvasElement;
  board: Board;
  cmdInvoker: CommandInvoker;
  event: MouseEvent;
}

/**
 * Method call went the user press down the mouse on the canvas
 * @param event
 */

export class MouseEvents extends BaseEvent {
  private isPanning: boolean;
  private panStart: Point;

  constructor(canvas: HTMLCanvasElement, board: Board, cmdInvoker: CommandInvoker) {
    super(canvas, board, cmdInvoker);
    this.isPanning = false;
    this.panStart = new Point(0, 0);
    this.canvas = canvas;
    this.board = board;
    this.cmdInvoker = cmdInvoker;
  }

  /**
   * Method call went the user move the mouse over the canvas
   * @param event
   */
  onMouseMove(event: MouseEvent) {
    if (!this.canvas) return;
    const mouseX = this.getMouseXPosition(event);
    const mouseY = this.getMouseYPosition(event);

    let p2: Point;
    switch (this.board.drawState) {
      case DrawState.None:
        break;
      case DrawState.Wall:
        if (this.board.isEditing) {
          p2 = new Point(mouseX - this.board.offset.x, mouseY - this.board.offset.y);
          this.cmdInvoker.execute(new EditLastWallWithPointCommand(p2), false);
        }
        break;

      case DrawState.Move:
        if (this.isPanning && this.canvas) {
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

    let p1: Point;
    let wall: Wall;
    switch (this.board.drawState) {
      case DrawState.Wall:
        p1 = new Point(startX - this.board.offset.x, startY - this.board.offset.y);
        wall = new Wall(p1, p1, 2, 'black');
        this.cmdInvoker.execute(new AddWallCommand(wall));
        break;

      case DrawState.Move:
        if (event.button === 0) { //Left click
          this.isPanning = true;
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
    this.isPanning = false;
  }

  private getMouseXPosition(event: MouseEvent): number {
    return (event.clientX - this.canvas.getBoundingClientRect().left) * (this.canvas.width / this.canvas.getBoundingClientRect().width);
  }

  private getMouseYPosition(event: MouseEvent): number {
    return (event.clientY - this.canvas.getBoundingClientRect().top) * (this.canvas.height / this.canvas.getBoundingClientRect().height);
  }


  override bind() {
    this.canvas?.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas?.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas?.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  override unbind() {
    this.canvas?.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas?.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas?.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }
}


