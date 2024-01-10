import {MouseEvents} from "./mouse-events";
import {CommandInvoker} from "../commands/command";
import {Board} from "../models/board";
import {KeyboardEvents} from "./keyboard-events";

export class EventHandler {
  public readonly mouseEvents: MouseEvents;
  public readonly keyboardEvents: KeyboardEvents;

  constructor(canvas: HTMLCanvasElement, board: Board, cmdInvoker: CommandInvoker) {
    this.mouseEvents = new MouseEvents(canvas, board, cmdInvoker);
    this.keyboardEvents = new KeyboardEvents(canvas, board, cmdInvoker);
    this.bind();
  }

  /**
   * Bind all events
   */
  protected bind() {
    this.mouseEvents.bind();
    this.keyboardEvents.bind();
  }

  /**
   * Unbind all events
   */
  protected unbind() {
    this.mouseEvents.unbind();
    this.keyboardEvents.unbind();
  }

}
