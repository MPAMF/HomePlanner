import {MouseEvents} from "./mouse-events";
import {CommandInvoker} from "../commands/command";
import {KeyboardEvents} from "./keyboard-events";

export class EventHandler {
  public readonly mouseEvents: MouseEvents;
  public readonly keyboardEvents: KeyboardEvents;

  constructor(cmdInvoker: CommandInvoker) {
    this.mouseEvents = new MouseEvents(cmdInvoker);
    this.keyboardEvents = new KeyboardEvents(cmdInvoker);
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
