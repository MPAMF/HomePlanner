import {MouseEvents} from "./mouse-events";
import {CommandInvoker} from "../commands/command";
import {KeyboardEvents} from "./keyboard-events";
import {MatDialog} from "@angular/material/dialog";

export class EventHandler {
  public readonly mouseEvents: MouseEvents;
  public readonly keyboardEvents: KeyboardEvents;

  constructor(cmdInvoker: CommandInvoker, actionCmdInvoker: CommandInvoker, dialog: MatDialog) {
    this.mouseEvents = new MouseEvents(cmdInvoker, actionCmdInvoker);
    this.keyboardEvents = new KeyboardEvents(cmdInvoker, actionCmdInvoker, dialog);
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
