import {BaseEvent} from "./base-event";
import {Board} from "../models/board";
import {CommandInvoker} from "../commands/command";
import {EditorDrawStateCommands, EditorRemoveLastWallCommand} from "../commands/editor-commands";
import {DrawState} from "../models/draw-state";

export class KeyboardEvents extends BaseEvent {

  constructor(cmdInvoker: CommandInvoker) {
    super(cmdInvoker);
  }

  onKeyDown(event: KeyboardEvent) {
    console.log(event);
    if (!this.cmdInvoker) {
      return;
    }
    const key = event.key;
    const lowerKey = key.toLowerCase();

    if (event.key === 'Escape') {
      this.cmdInvoker.execute(new EditorRemoveLastWallCommand());
      this.cmdInvoker.execute(new EditorDrawStateCommands(DrawState.None));
      return;
    }

    if (lowerKey === 'w') {
      this.cmdInvoker.execute(new EditorDrawStateCommands(DrawState.Wall));
      return;
    }

    // All events with Ctrl
    if (event.ctrlKey) {
      if (lowerKey === 'z') {
        this.cmdInvoker.undo();
        return;
      }

      if (lowerKey === 'y') {
        this.cmdInvoker.redo();
        return;
      }

    }


  }


  override bind() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  override unbind() {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
  }
}
