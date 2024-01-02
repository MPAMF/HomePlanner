import {Command} from "./command";
import {Wall} from "../models/wall";
import {Point} from "../models/point";

export class AddWallCommand extends Command {

  constructor(private wall: Wall) {
    super();
  }

  override execute(): void {
    this.board.walls.push(this.wall);
    this.board.isEditing = true;
  }

  override undo(): void {
    //this.board.drawState = DrawState.None; // TODO: maybe set to previous state
    const index = this.board.walls.indexOf(this.wall);
    if (index > -1) {
      this.board.walls.splice(index, 1);
    }
  }
}

export class RemoveWallCommand extends Command {
  private removedWall: Wall | null = null;

  constructor(private wall: Wall) {
    super();
  }

  override execute(): void {
    const index = this.board.walls.indexOf(this.wall);
    if (index > -1) {
      this.removedWall = this.wall;
      this.board.walls.splice(index, 1);
    }
  }

  override undo(): void {
    if (this.removedWall) {
      this.board.walls.push(this.removedWall);
    }
  }
}

export class RemoveLastWallCommand extends Command {
  private removedWall: Wall | null = null;

  constructor() {
    super();
  }

  override execute(): void {
    const index = this.board.walls.length - 1;
    if (index > -1) {
      this.removedWall = this.board.walls[index];
      this.board.walls.splice(index, 1);
    }
  }

  override undo(): void {
    if (this.removedWall) {
      this.board.walls.push(this.removedWall);
    }
  }
}

export class EditLastWallWithPointCommand extends Command {

  constructor(private p2: Point) {
    super();
  }

  override execute(): void {
    this.board.walls[this.board.walls.length - 1].p2 = this.p2;
  }

  override undo(): void {

  }
}

export class MoveWallCommand extends Command {

  constructor(private delta: Point) {
    super();
  }

  override execute(): void {
    this.board.offset.x += this.delta.x;
    this.board.offset.y += this.delta.y;
  }

  override undo(): void {
    this.board.offset.x -= this.delta.x;
    this.board.offset.y -= this.delta.y;
  }
}
