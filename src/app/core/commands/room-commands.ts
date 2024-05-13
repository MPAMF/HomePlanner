import {Command} from "./command";
import {Wall} from "../models/wall";
import {Room} from "../models/room";
import {DrawState} from "../models/draw-state";
import {ClickablePoint} from "../models/clickable-point";
import {RoomNeedSwitchPoint} from "../models/interfaces/room-need-switch-point";
import {Point} from "../models/point";
import {ClickableState} from "../models/interfaces/clickable";


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
      let diagonalMidPoint: Point;
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

          // Update rooms
          list1.push(...lastRoom.walls);
          room.walls = list1;
          lastRoom.walls.push(...list2);

          diagonalMidPoint = findCenterPoint(list1);
          fillWallSwitchPoint(room, diagonalMidPoint);
          diagonalMidPoint = findCenterPoint(list2);
          fillWallSwitchPoint(lastRoom, diagonalMidPoint);

          room.sortWalls();
          return;
        }
      }
    }
  }

  override undo(): void {

  }
}

function findCenterPoint(walls: Wall[]): Point {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  walls.forEach(wall => {
    startX += wall.p1.point.x;
    startY += wall.p1.point.y;
    endX += wall.p2.point.x;
    endY += wall.p2.point.y;
  });

  const centerX = (startX + endX) / (2 * walls.length);
  const centerY = (startY + endY) / (2 * walls.length);

  return new Point(centerX, centerY);
}

function fillWallSwitchPoint(room: Room, diagonalMidPoint: Point): void {
  for( const wall of room.walls){

    if(diagonalMidPoint.isLeft(wall.p1.point, wall.p2.point)){
      if(wall.roomNeedSwitchPoint[room.id] && wall.roomNeedSwitchPoint[room.id].isSwitch){
        wall.roomNeedSwitchPoint[room.id].isSwitch = true;
      }else {
        wall.roomNeedSwitchPoint[room.id] = new RoomNeedSwitchPoint(true);
      }
    } else {
      if(wall.roomNeedSwitchPoint[room.id] && wall.roomNeedSwitchPoint[room.id].isSwitch){
        wall.roomNeedSwitchPoint[room.id].isSwitch = false;
      }else {
        wall.roomNeedSwitchPoint[room.id] = new RoomNeedSwitchPoint();
      }
    }
  }
}
