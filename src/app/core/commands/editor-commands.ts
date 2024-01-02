import {Command} from "./command";
import {DrawState} from "../models/draw-state";
import {Wall} from "../models/wall";

export class EditorDrawStateCommands extends Command {
  private lastDrawState: DrawState | null = null;

  constructor(private drawState: DrawState) {
    super();
  }

  override execute(): void {
    this.lastDrawState = this.board.drawState;
    this.board.drawState = this.drawState;
    this.board.isEditing = false;
  }

  override undo(): void {
    if (this.lastDrawState) {
      this.board.drawState = this.lastDrawState;
    }
  }
}

export class EditorRemoveLastWallCommand extends Command {
  private removedWall: Wall | null = null;

  constructor() {
    super();
  }

  override execute(): void {
    if(this.board.drawState == DrawState.Wall){
      const index = this.board.walls.length - 1;
      if (index > -1) {
        this.removedWall = this.board.walls[index];
        this.board.walls.splice(index, 1);
      }
    }
  }

  override undo(): void {
    if (this.removedWall) {
      this.board.walls.push(this.removedWall);
    }
  }
}
