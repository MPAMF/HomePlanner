import {Command} from "./command";
import {Wall} from "../models/wall";
import {Point} from "../models/point";
import {Room} from "../models/room";
import {DrawState} from "../models/draw-state";
import {DrawOn} from "../models/canvas";
import {Utils} from "../modules/utils";
import {ClickablePoint} from "../models/clickable-point";
import {Clickable} from "../models/interfaces/clickable";


export class FinaliseRoomCommand extends Command {

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
    this.board.normalisePoints();
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

export class CurrentRoomSharedIntoTwoRoomsCommand extends Command {

  constructor(private wall: Wall,) {
    super();
  }

  override execute(): void {

    if(this.board.rooms.length -1 >= 0 && this.board.rooms[this.board.rooms.length -1]) {
      const lastRoom: Room = this.board.rooms[this.board.rooms.length -1];

      const firstWall : Wall = lastRoom.walls[0];
      const lastWall : Wall = lastRoom.walls[lastRoom.walls.length -1];

      const list1: Wall[] = [];
      const list2: Wall[] = [];

      for (const room of this.board.rooms){
        for (const wall of room.walls) {

          if(wall == this.wall) {
            const sortedWallList  = room.sortWalls();
            const firstIndex = sortedWallList[wall.p1.id].wallsIndex[0];
            list1.push( room.walls[firstIndex]);

            let currentIndex: number = sortedWallList[wall.p1.id].wallsIndex[1];
            let currentWall: Wall;
            let switchListState: boolean = false;

            while (currentIndex != firstIndex) {
              currentWall = room.walls[currentIndex];

              if(switchListState) {
                list2.push(currentWall);
              } else {
                list1.push(currentWall);
              }

              if(currentWall.p1.equals(firstWall.p1)  || currentWall.p1.equals(lastWall.p2)) {
                switchListState = !switchListState;
              }

              currentIndex = sortedWallList[currentWall.p1.id].wallsIndex[1];
            }

            console.log(list1)
            console.log(list2)
            for (const wall of list2){
              wall.setColor("yellow");
            }

            list1.push(...lastRoom.walls);
            room.walls = list1;
            lastRoom.walls.push(...list2)

            return;
          }
        }
      }
    }
  }

  override undo(): void {

  }
}
