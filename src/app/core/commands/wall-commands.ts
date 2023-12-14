import {Command} from "./command";
import {Board} from "../models/board";
import {Wall} from "../models/wall";

export class AddWallCommand implements Command {
    constructor(private editor: Board, private wall: Wall) {}

    execute(): void {
        this.editor.walls.push(this.wall);
    }

    undo(): void {
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
