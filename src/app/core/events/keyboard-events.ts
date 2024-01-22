import {BaseEvent} from "./base-event";
import {CommandInvoker} from "../commands/command";
import {EditorDrawStateCommands} from "../commands/editor-commands";
import {DrawState} from "../models/draw-state";
import {RemoveWallCommand} from "../commands/wall-commands";

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
      if (this.board.drawState === DrawState.WallCreation && this.board.currentRoom && this.board.currentRoom.hasAnyWalls()) {
        const lastWall = this.board.currentRoom.walls[this.board.currentRoom.walls.length - 1];
        this.cmdInvoker.execute(new RemoveWallCommand(lastWall));
      } else {
        this.cmdInvoker.execute(new EditorDrawStateCommands(DrawState.None));
      }
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
