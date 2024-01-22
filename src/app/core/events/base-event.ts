import {CommandInvoker} from "../commands/command";
import {Board} from "../models/board";

export abstract class BaseEvent {
  protected canvasCtx: CanvasRenderingContext2D;
  protected board: Board;
  protected cmdInvoker: CommandInvoker;
  protected actionCmdInvoker: CommandInvoker;

  protected constructor(cmdInvoker: CommandInvoker, actionCmdInvoker: CommandInvoker) {
    this.cmdInvoker = cmdInvoker;
    this.actionCmdInvoker = actionCmdInvoker;
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
