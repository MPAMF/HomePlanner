import {CommandInvoker} from "../commands/command";
import {Board} from "../models/board";

export abstract class BaseEvent {
  protected canvas: CanvasRenderingContext2D;
  protected board: Board;
  protected cmdInvoker: CommandInvoker;

  protected constructor(cmdInvoker: CommandInvoker) {
    this.cmdInvoker = cmdInvoker;
    this.canvas = cmdInvoker.ctx!;
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
