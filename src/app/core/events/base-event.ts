import {CommandInvoker} from "../commands/command";
import {Board} from "../models/board";

export abstract class BaseEvent {
  protected canvas: HTMLCanvasElement;
  protected board: Board;
  protected cmdInvoker: CommandInvoker;

  protected constructor(canvas: HTMLCanvasElement, board: Board, cmdInvoker: CommandInvoker) {
    this.canvas = canvas;
    this.board = board;
    this.cmdInvoker = cmdInvoker;
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
