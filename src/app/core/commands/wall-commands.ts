import {Command} from "./command";
import {Wall} from "../models/wall";
import {Point} from "../models/point";
import {Room} from "../models/room";
import {DrawState} from "../models/draw-state";
import {clearCanvas, DrawOn} from "../models/canvas";

export class AddWallCommand extends Command {

  constructor(private wall: Wall) {
    super();
  }

  override execute(): void {
    if (!this.board.currentRoom) {
      this.board.currentRoom = new Room("Room 1"); // TODO: replace hardcoded name
    }
    this.board.drawState = DrawState.WallCreation;
    this.board.currentRoom.addWall(this.wall);
  }

  override undo(): void {
    this.board.drawState = DrawState.Wall;
    if (!this.board.currentRoom) {
      return;
    }
    this.board.currentRoom.removeWall(this.wall);
    // Remove the room if there are no walls left
    if (!this.board.currentRoom.hasAnyWalls()) {
      this.board.currentRoom = undefined;
    }
  }
}

export class RemoveWallCommand extends Command {
  private removedWall: Wall | null = null;

  constructor(private wall: Wall) {
    super();
  }

  override execute(): void {
    if (!this.board.currentRoom) {
      return;
    }
    this.board.currentRoom.removeWall(this.wall);
    // Remove the room if there are no walls left
    if (!this.board.currentRoom.hasAnyWalls()) {
      this.board.currentRoom = undefined;
    }
  }

  override undo(): void {
    // TODO: The removed wall should have the same properties as the wall that was removed
    if (!this.board.currentRoom) {
      this.board.currentRoom = new Room("Room 1"); // TODO: replace hardcoded name
    }
    this.board.currentRoom.addWall(this.wall);
  }
}

// export class RemoveLastWallCommand extends Command {
//   private removedWall: Wall | null = null;
//
//   constructor() {
//     super();
//   }
//
//   override execute(): void {
//     const index = this.board.walls.length - 1;
//     if (index > -1) {
//       this.removedWall = this.board.walls[index];
//       this.board.walls.splice(index, 1);
//     }
//   }
//
//   override undo(): void {
//     if (this.removedWall) {
//       this.board.walls.push(this.removedWall);
//     }
//   }
// }

export class EditLastWallWithPointCommand extends Command {

  constructor(private p2: Point) {
    super(DrawOn.SnappingLine);
  }

  override execute(): void {
    if (this.board.drawState !== DrawState.WallCreation || !this.board.currentRoom) {
      return;
    }
    const wall = this.board.currentRoom.getLastWall();
    if (!wall) return;

    const closestPt = this.board.findClosestWallPoint(this.p2, 10, true);
    if (!closestPt) {
      wall.p2 = this.p2;
      return;
    }

    wall.p2 = closestPt[0];
  }

  override undo(): void {
    throw new Error("Method not implemented (please dont save it into cmd invoker history).");
  }
}

export class FinaliseLastWallCommand extends Command {

  constructor() {
    super();
  }

  override execute(): void {
    if (!this.board.currentRoom) {
      return;
    }
    const currentRoom = this.board.currentRoom;
    currentRoom.isFinalized = true;
    const wall = currentRoom.getLastWall();
    if (wall) {
      wall.isFinalized = true;
    }

    this.board.rooms.push(currentRoom);
    this.board.currentRoom = undefined;
    this.board.drawState = DrawState.None; // When a room is finalized, the user should not be able to draw walls
  }

  override undo(): void {
    const room = this.board.rooms.pop();
    if (!room) { // Should never happen, but just in case
      return;
    }
    this.board.currentRoom = room;
    room.isFinalized = false;
    this.board.drawState = DrawState.WallCreation;
    const lastWall = room.getLastWall();
    if (lastWall) {
      lastWall.isFinalized = false;
    }
  }
}
