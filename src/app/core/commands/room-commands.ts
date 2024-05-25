import {Command} from "./command";
import {Wall} from "../models/wall";
import {Room} from "../models/room";
import {DrawState} from "../models/draw-state";
import {ClickablePoint} from "../models/clickable-point";
import {RoomNeedSwitchPoint} from "../models/interfaces/room-need-switch-point";
import {Point} from "../models/point";
import {ClickableState} from "../models/interfaces/clickable";
import {Utils} from "../modules/utils";


export class FinaliseRoomCommand extends Command {

  constructor() {
    super();
  }

  override do(): void {
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

  override do(): void {

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
            if (currentWall.getP1(room.id).equals(firstWall.p1) || currentWall.getP1(room.id).equals(lastWall.p2)) {
              switchListState = !switchListState;
            }

            currentIndex = sortedWallList[currentWall.getP1(room.id).id].wallsIndex[1];
          }

          // Update rooms section

          // Switch between p1 and p2 if the wall disposition isn't cyclic
          for (const wall of lastRoom.walls){
            if(list1.some(cyclicWall => wall.getP1(room.id).equals(cyclicWall.getP1(room.id)))){
              if (wall.roomNeedSwitchPoint[room.id] && wall.roomNeedSwitchPoint[room.id].isSwitch){
                wall.roomNeedSwitchPoint[room.id].isSwitch = true;
              } else {
                wall.roomNeedSwitchPoint[room.id] = new RoomNeedSwitchPoint(true);
              }
            }

            list1.push(wall);
          }
          room.walls = list1;

          // transfers switches from the old room to the new one
          for (const wall of list2){
            if (wall.roomNeedSwitchPoint[room.id]){
              wall.roomNeedSwitchPoint[lastRoom.id] = new RoomNeedSwitchPoint(wall.roomNeedSwitchPoint[room.id].isSwitch);
            }
          }

          // Switch between p1 and p2 if the wall disposition isn't cyclic
          for (const wall of lastRoom.walls){
            if(list2.some(cyclicWall => wall.getP1(lastRoom.id).equals(cyclicWall.getP1(lastRoom.id)))){
              if (wall.roomNeedSwitchPoint[lastRoom.id] && wall.roomNeedSwitchPoint[lastRoom.id].isSwitch){
                wall.roomNeedSwitchPoint[lastRoom.id].isSwitch = true;
              } else {
                wall.roomNeedSwitchPoint[lastRoom.id] = new RoomNeedSwitchPoint(true);
              }
            }

            list2.push(wall);
          }

          lastRoom.walls = list2;
          return;
        }
      }
    }
  }

  override undo(): void {

  }
}
