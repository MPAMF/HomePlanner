import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommandInvoker} from "../../../commands/command";
import {MatIconModule} from "@angular/material/icon";
import {TranslateModule} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {SettingsComponent} from "../../settings/settings.component";
import {Wall} from "../../../models/wall";
import {ClickablePoint} from "../../../models/clickable-point";
import {RoomNeedSwitchPointDictionary} from "../../../models/interfaces/room-need-switch-point";
import {WallElement} from "../../../models/wall-element";
import {Point} from "../../../models/point";
import {Window} from "../../../models/wall-elements/window";
import {Door} from "../../../models/wall-elements/door";
import {Room} from "../../../models/room";
import {DrawOn} from "../../../models/canvas";


@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  @Input() commandInvoker?: CommandInvoker;
  @Input() actionsCommandInvoker?: CommandInvoker;

  constructor(private matDialog: MatDialog) {
  }

  onClickUndo() {
    if (!this.commandInvoker || !this.commandInvoker.canUndo()) return;
    this.commandInvoker.undo();
  }

  onClickRedo() {
    if (!this.commandInvoker || !this.commandInvoker.canRedo()) return;
    this.commandInvoker.redo();
  }

  openSettingsModal() {
    this.matDialog.open(SettingsComponent, {
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      width: '400px',
      data: {
        canvas: this.commandInvoker?.canvas
      }
    });
  }

  exportToPng() {
    if (!this.commandInvoker || !this.commandInvoker.canvas) return;
    const link = document.createElement('a');

    for (const room of this.commandInvoker.board.rooms){
      for (const wall of room.walls){
        wall.drawUnits(this.commandInvoker.canvas.background, this.commandInvoker.canvas.scale)
      }
    }

    const date = new Date();
    link.download = `HomePlanner_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.png`;
    link.href = this.commandInvoker?.canvas?.background.canvas.toDataURL()
    link.click();

    this.commandInvoker?.redraw(DrawOn.Background);
  }

  saveProjectToJson(): void {
    if(!this.commandInvoker || !this.commandInvoker.board) return;
    const jsonData = this.exportToJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date();
    a.href = url;
    a.download = `HomePlanner_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  importProjectFromJson(event: Event): void {
    if(!this.commandInvoker || !this.commandInvoker.board || !event || !event.target) return;

    const file = (event.target as HTMLInputElement).files;
    if (file && file[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {

        const fileContent = e.target && e.target.result ? e.target.result.toString() : "";
        try {
          const jsonData = JSON.parse(fileContent);
          this.loadProjectFromJson(jsonData);
        } catch (error) {
          console.error('Invalid JSON file', error);
        }
      };
      reader.readAsText(file[0]);
    }
  }

  private exportToJSON(): string {
    if(!this.commandInvoker || !this.commandInvoker.board) return "";

    const walls: WallObjectExportDictionary = {};
    for(const room of this.commandInvoker.board.rooms){
      for(const wall of room.walls){
        if(!(wall.id in walls)){
          walls[wall.id] = ({
            p1: {
              point: wall.p1.point,
            },
            p2: {
              point: wall.p2.point
            },
            thickness: wall.getThickness(),
            color: wall.getColor(),
            selectedColor: wall.getSelectedColor(),
            roomNeedSwitchPoint: wall.roomNeedSwitchPoint,

            elements: wall.elements.map(element => ({
              type: element instanceof Window ? "Window" : "Door",
              p1: element.p1,
              p2: element.p2,
              parentWallP1: element.parentWallP1,
              parentWallP2: element.parentWallP2,
              length: element.getLength(),
              thickness: element.getThickness(),
              color: element.getColor(),
              selectedColor: element.getSelectedColor(),
              isRotated: element.isRotated,
              isTurnedToLeft: element.isTurnedToLeft
            }))
          });
        }
      }
    }

    const data = {
      scale: this.commandInvoker.canvas?.scale,
      boardConfig: {
        wallColor: this.commandInvoker.board.boardConfig.wallColor,
        selectWallColor: this.commandInvoker.board.boardConfig.selectWallColor,
        wallThickness: this.commandInvoker.board.boardConfig.wallThickness,
        windowColor: this.commandInvoker.board.boardConfig.windowColor,
        selectWindowColor: this.commandInvoker.board.boardConfig.selectWindowColor,
        windowThickness: this.commandInvoker.board.boardConfig.windowThickness,
        windowLength: this.commandInvoker.board.boardConfig.windowLength,
      },
      rooms: this.commandInvoker.board.rooms.map(room => ({
        id: room.id,
        name: room.name,
        walls: room.walls.map(wall => wall.id)
      })),
      walls: walls
    };

    return JSON.stringify(data, null, 2);
  }

  onSelectFile(): void {
    const fileInput = document.querySelector('#fileInput') as HTMLElement;
    fileInput.click();
  }

  private loadProjectFromJson(jsonData: jsonExportClass): void {
    if(!this.commandInvoker || !this.commandInvoker.board || !this.commandInvoker.canvas) return;

    const wallCloned: WallExportDictionary = {};
    for(const wallKey in jsonData.walls){

      wallCloned[wallKey] = new Wall(
        new ClickablePoint(new Point(jsonData.walls[wallKey].p1.point.x, jsonData.walls[wallKey].p1.point.y)),
        new ClickablePoint(new Point(jsonData.walls[wallKey].p2.point.x, jsonData.walls[wallKey].p2.point.y)),
        {},
        jsonData.boardConfig.wallThickness,
        jsonData.boardConfig.wallColor,
        jsonData.boardConfig.selectWallColor,
        jsonData.walls[wallKey].thickness,
        jsonData.walls[wallKey].color,
        jsonData.walls[wallKey].selectedColor,
        jsonData.walls[wallKey].elements.map(element =>
          element.type == "Window" ? new Window(
            new Point(element.p1.x, element.p1.y),
            new Point(element.parentWallP1.x, element.parentWallP1.y),
            new Point(element.parentWallP2.x, element.parentWallP2.y),
            jsonData.boardConfig.windowLength,
            jsonData.boardConfig.windowThickness,
            jsonData.boardConfig.windowColor,
            jsonData.boardConfig.selectWindowColor,
            true,
            element.thickness,
            element.color,
            element.selectedColor,
            element.length,
            element.isRotated,
            element.isTurnedToLeft
          ) : new Door(
            new Point(element.p1.x, element.p1.y),
            new Point(element.parentWallP1.x, element.parentWallP1.y),
            new Point(element.parentWallP2.x, element.parentWallP2.y),
            jsonData.boardConfig.windowLength,
            jsonData.boardConfig.windowThickness,
            jsonData.boardConfig.windowColor,
            jsonData.boardConfig.selectWindowColor,
            true,
            element.thickness,
            element.color,
            element.selectedColor,
            element.length,
            element.isRotated,
            element.isTurnedToLeft
          )
        ),
        true
      )
    }

    for (const roomKey of jsonData.rooms){

      const currentRoom: Room = new Room(
        roomKey.name,
        '',
        true,
        []
      );

      for (const wallKey of roomKey.walls){
        console.log(jsonData.walls[wallKey].roomNeedSwitchPoint)
        console.log(roomKey)
        if(jsonData.walls[wallKey].roomNeedSwitchPoint[roomKey.id]){
          wallCloned[wallKey].roomNeedSwitchPoint[currentRoom.id] = jsonData.walls[wallKey].roomNeedSwitchPoint[roomKey.id];
        }

        currentRoom.walls.push(wallCloned[wallKey]);
      }

      this.commandInvoker.canvas.scale = jsonData.scale;
      this.commandInvoker.board.rooms.push(currentRoom);
      this.commandInvoker?.redraw(DrawOn.Background);
      this.commandInvoker.board.normalisePoints();
    }

    console.log(wallCloned)
  }
}

export interface WallObjectExportDictionary {
  [key: string]: WallObject;
}

export interface WallExportDictionary {
  [key: string]: Wall;
}

interface WallObject {
  p1: ClickablePointObject
  p2: ClickablePointObject
  thickness: number | undefined
  color: string | undefined
  selectedColor: string | undefined
  roomNeedSwitchPoint: RoomNeedSwitchPointDictionary
  elements: WallElementObject[]
}

interface ClickablePointObject {
  point: Point
}

interface WallElementObject {
  type: string
  p1: Point,
  p2: Point,
  parentWallP1: Point,
  parentWallP2: Point,
  length: number
  thickness: number | undefined
  color: string | undefined
  selectedColor: string | undefined
  isRotated: boolean
  isTurnedToLeft: boolean
}

interface jsonExportClass {
  scale: number
  boardConfig: {
    wallColor: string;
    selectWallColor: string;
    wallThickness: number;
    windowColor: string;
    selectWindowColor: string;
    windowThickness: number;
    windowLength: number;
  }
  rooms: {
    id: string
    name: string
    walls: string[]
  }[],
  walls: WallObjectExportDictionary
}
