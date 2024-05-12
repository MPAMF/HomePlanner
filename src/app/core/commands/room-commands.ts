import {Command} from "./command";
import {Wall} from "../models/wall";
import {Room} from "../models/room";
import {DrawState} from "../models/draw-state";
import {ClickablePoint} from "../models/clickable-point";


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

export class SplitRoomCommand extends Command {

  constructor(private wall: Wall,) {
    super();
  }

  override execute(): void {

    if (this.board.rooms.length >= 1 && this.board.rooms[this.board.rooms.length - 1]) {
      const lastRoom: Room = this.board.rooms[this.board.rooms.length - 1];
      const firstWall: Wall = lastRoom.walls[0];
      const lastWall: Wall = lastRoom.walls[lastRoom.walls.length - 1];

      const list1: Wall[] = [];
      const list2: Wall[] = [];
      let leftWallInRoom: boolean = false;
      let rightWallInRoom: boolean = false;
      for (const room of this.board.rooms) {

        leftWallInRoom = false;
        rightWallInRoom = false;
        // This execution is to select the room which contain the last room
        for (const wall of room.walls) {
          if (wall.p1.equals(firstWall.p1)) {
            leftWallInRoom = true;
          } else if (wall.p1.equals(lastWall.p2)) {
            rightWallInRoom = true;
          }
        }

        // This condition is execute the reordering process on the right room
        if (leftWallInRoom && rightWallInRoom) {



          const sortedWallList = room.sortWalls();
          const firstIndex = sortedWallList[this.wall.p1.id].wallsIndex[0];
          list1.push(room.walls[firstIndex]);

          let currentIndex: number = sortedWallList[this.wall.p1.id].wallsIndex[1];
          let currentWall: Wall;
          let switchListState: boolean = false;

          // Add the wall in the right room
          while (currentIndex != firstIndex) {
            currentWall = room.walls[currentIndex];

            if (switchListState) {
              list2.push(currentWall);
            } else {
              list1.push(currentWall);
            }

            // Conditions to switch between the two lists
            if (currentWall.p1.equals(firstWall.p1) || currentWall.p1.equals(lastWall.p2)) {
              switchListState = !switchListState;
            }

            currentIndex = sortedWallList[currentWall.getP1(room.id).id].wallsIndex[1];
          }

          for( const wall of list1){
            if(wall.roomNeedSwitchPoint[room.id]){
              wall.roomNeedSwitchPoint[room.id] = !wall.roomNeedSwitchPoint[room.id];
            } else {
              wall.roomNeedSwitchPoint[room.id] = true;
            }
          }

          for( const wall of list1){
            if(wall.roomNeedSwitchPoint[room.id]){
              wall.setColor('blue')
            } else {
              //wall.setColor('black')
            }
          }

          // Update rooms
          list1.push(...lastRoom.walls);
          room.walls = list1;
          lastRoom.walls.push(...list2);

          lastRoom.sortWalls();
          return;
        }
      }
    }
  }

  override undo(): void {

  }
}
