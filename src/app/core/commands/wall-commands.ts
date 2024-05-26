import {Command} from "./command";
import {Wall} from "../models/wall";
import {Point} from "../models/point";
import {Room} from "../models/room";
import {DrawState} from "../models/draw-state";
import {DrawOn} from "../models/canvas";
import {Utils} from "../modules/utils";
import {ClickablePoint} from "../models/clickable-point";
import {Clickable} from "../models/interfaces/clickable";
import {RoomNeedSwitchPoint} from "../models/interfaces/room-need-switch-point";

export class AddWallCommand extends Command {

  private previousDrawSate: DrawState = DrawState.None;

  constructor(private wall: Wall) {
    super();
  }

  override do(): void {
    if (!this.board.currentRoom) {
      this.board.currentRoom = new Room("Room 1"); // TODO: replace hardcoded name
    } else {
      const lastWall = this.board.currentRoom.getLastWall();
      if (lastWall) {
        lastWall.isFinalized = true;
      }
    }

    this.wall.roomNeedSwitchPoint[this.board.currentRoom.id] = new RoomNeedSwitchPoint();
    this.previousDrawSate = this.board.drawState;
    this.board.drawState = DrawState.WallCreation;
    this.board.currentRoom.addWall(this.wall);
  }

  override undo(): void {
    this.board.drawState = this.previousDrawSate;
    if (!this.board.currentRoom) {
      return;
    }
    this.board.currentRoom.removeWall(this.wall);

    // Remove the room if there are no walls left
    if (!this.board.currentRoom.hasAnyWalls()) {
      this.board.currentRoom = undefined;
      this.board.drawState = DrawState.None;
    } else {
      const lastWall = this.board.currentRoom.getLastWall();
      if (lastWall) {
        lastWall.isFinalized = false;
      }
    }
  }
}

export class EditLastWallWithPointCommand extends Command {

  constructor(private p2: Point) {
    super(DrawOn.SnappingLine);
  }

  override do(): void {
    if (this.board.drawState !== DrawState.WallCreation || !this.board.currentRoom) {
      return;
    }
    const wall = this.board.currentRoom.getLastWall();
    if (!wall) return;

    const closestPt = this.board.findClosestWallPoint(this.p2, 10, true);
    if (closestPt) {
      wall.p2.point = closestPt[0];
      return;
    }

    wall.p2.point = this.p2;
    const angleInDegreesWithUnitaryVector: number = wall.calculateAngleWithTwoPoints(wall.p1.point, new Point(wall.p1.x + 1, wall.p1.y));
    const divisionResult: number = Utils.CalculatePIOverFour(angleInDegreesWithUnitaryVector);

    let divisionResultModuloOne: number = divisionResult % 1;
    if (divisionResultModuloOne >= 0.95 || divisionResultModuloOne <= 0.05) {

      divisionResultModuloOne = Math.round(divisionResultModuloOne % 1)
      const newAngle: number = (Math.trunc(divisionResult) + divisionResultModuloOne) * 45;
      const newAngleToRadian: number = Utils.ConvertAngleToRadian(newAngle);

      const len: number = wall.length();
      wall.p2.point = new Point(wall.p1.x + len * Math.cos(newAngleToRadian),
        wall.p1.y + len * Math.sin(-newAngleToRadian));
    }
  }

  override undo(): void {
    throw new Error("Method not implemented (please dont save it into cmd invoker history).");
  }
}

export class DivideWallCommand extends Command {
  private newWall?: Wall;

  constructor(
    private wall: Wall,
    private clickablePoint? : ClickablePoint,
  ) {
    super();
  }

  override do(): void {

    if( !this.clickablePoint ){
      this.clickablePoint = new ClickablePoint(this.wall.midpoint());
    }

    this.newWall = this.wall.clone();
    this.newWall.p1 = this.clickablePoint;
    this.wall.p2 = this.clickablePoint;

    this.wall.cleanOuterWallElement();
    this.newWall.cleanOuterWallElement();

    for (const room of this.board.rooms){
      for (const wall of room.walls) {

        if ( wall == this.wall) {
          if(this.wall.roomNeedSwitchPoint[room.id] && this.wall.roomNeedSwitchPoint[room.id].isSwitch && this.board.currentRoom){
            this.wall.roomNeedSwitchPoint[this.board.currentRoom.id] = new RoomNeedSwitchPoint(true);
            this.newWall.roomNeedSwitchPoint[this.board.currentRoom.id] = new RoomNeedSwitchPoint(true);
          }

          room.addWall(this.newWall);
        }
      }
    }
    this.board.normalisePoints();
  }

  override undo(): void {
    if (this.newWall){
      this.wall.p2 = this.newWall.p2;
      const wallToDelete: Wall = this.newWall;

      for (const room of this.board.rooms){
        room.walls = room.walls.filter(wall => !wall.equals(wallToDelete));
      }
      this.board.normalisePoints();
    }
  }
}
