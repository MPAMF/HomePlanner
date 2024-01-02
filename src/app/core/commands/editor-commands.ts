import {Command} from "./command";
import {DrawState} from "../models/draw-state";

export class EditorDrawStateCommands extends Command {

  constructor(private drawState: DrawState) {
    super();
  }

  override execute(): void {
    this.board.drawState = this.drawState;
    this.board.isEditing = false;
  }

  override undo(): void {
    //ToDo
  }
}
