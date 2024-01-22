import {Command} from "./command";
import {DrawState} from "../models/draw-state";

export class EditorDrawStateCommands extends Command {
  private lastDrawState: DrawState | null = null;

  constructor(private drawState: DrawState) {
    super();
  }

  override execute(): void {
    this.lastDrawState = this.board.drawState;
    this.board.drawState = this.drawState;
  }

  override undo(): void {
    if (this.lastDrawState) {
      this.board.drawState = this.lastDrawState;
    }
  }
}
