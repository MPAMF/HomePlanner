import {Command} from "./command";
import {Wall} from "../models/wall";
import {DrawState} from "../models/draw-state";


export class EditorDrawStateCommands extends Command {

  constructor(private drawState: DrawState) {
    super();
  }

  override execute(): void {
    this.board.drawState = this.drawState;
  }

  override undo(): void {
    //ToDo
  }
}
