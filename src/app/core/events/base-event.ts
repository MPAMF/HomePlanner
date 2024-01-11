import {CommandInvoker} from "../commands/command";
import {Board} from "../models/board";
import {Canvas} from "../models/canvas";

export abstract class BaseEvent {
  protected canvas: Canvas;
  protected board: Board;
  protected cmdInvoker: CommandInvoker;

  protected constructor(cmdInvoker: CommandInvoker) {
    this.cmdInvoker = cmdInvoker;
    this.canvas = cmdInvoker.canvas!;
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
