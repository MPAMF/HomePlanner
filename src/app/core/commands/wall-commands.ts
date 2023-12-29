import {Command} from "./command";
import {Board} from "../models/board";
import {Wall} from "../models/wall";
import {Point} from "../models/point";

export class AddWallCommand implements Command {

    constructor(private editor: Board, private wall: Wall) {}

    execute(): void {
        this.editor.isDrawingWalls = true;
        this.editor.walls.push(this.wall);
    }

    undo(): void {
      this.editor.isDrawingWalls = false;
        const index = this.editor.walls.indexOf(this.wall);
        if (index > -1) {
            this.editor.walls.splice(index, 1);
        }
    }
}

class RemoveWallCommand implements Command {
    private removedWall: Wall | null = null;

    constructor(private editor: Board, private wall: Wall) {}

    execute(): void {
        const index = this.editor.walls.indexOf(this.wall);
        if (index > -1) {
            this.removedWall = this.wall;
            this.editor.walls.splice(index, 1);
        }
    }

    undo(): void {
        if (this.removedWall) {
            this.editor.walls.push(this.removedWall);
        }
    }
}

export class EditLastWallWithPointCommand implements Command {

  constructor(private editor: Board, private p2: Point) {}

  execute(): void {
    if(this.editor.isDrawingWalls){
      this.editor.walls[this.editor.walls.length - 1].p2 = this.p2;
    }
  }

  undo(): void {

  }
}
