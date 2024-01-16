import {CommandInvoker} from "../commands/command";
import {Board} from "../models/board";

export abstract class BaseEvent {
  protected canvasCtx: CanvasRenderingContext2D;
  protected board: Board;
  protected cmdInvoker: CommandInvoker;

  protected constructor(cmdInvoker: CommandInvoker) {
    this.cmdInvoker = cmdInvoker;
    this.canvasCtx = cmdInvoker.ctx!;
    this.board = cmdInvoker.board;
  }

  /**
   * Bind all events
   */
  abstract bind(): void;

  /**
   * Unbind all events
   */
  abstract unbind(): void;

}
