import {Command} from "./command";
import {Clickable} from "../models/interfaces/clickable";
import {WallElement} from "../models/wall-element";
import {Wall} from "../models/wall";

export class HideClickableCommand extends Command {

  private previousVisibleSate: boolean = true;

  constructor(private clickable: Clickable) {
    super();
  }

  override do(): void {
    this.previousVisibleSate = this.clickable.getVisibleState();
    this.clickable.setVisibleState(!this.previousVisibleSate);
  }

  override undo(): void {
    this.clickable.setVisibleState(this.previousVisibleSate);
  }
}

export class RotateWallElementCommand extends Command {

  constructor(
    private wallElement: WallElement
  ) {
    super();
  }

  override do(): void {
    this.wallElement.isRotated = !this.wallElement.isRotated;
    this.wallElement.update(this.wallElement.p1);
  }

  override undo(): void {
    this.wallElement.isRotated = !this.wallElement.isRotated;
    this.wallElement.update(this.wallElement.p1);
  }
}

export class RemoveWallElementCommand extends Command {
  private parentWall?: Wall;

  constructor(
    private element: WallElement
  ) {
    super();
  }

  override do(): void {
    for (const room of this.board.rooms){
      for (const wall of room.walls){
        for (const element of wall.elements){
          if( element.equals(this.element)){
            this.parentWall = wall;
            break;
          }
        }
      }
    }

    if(this.parentWall) {
      this.parentWall.elements = this.parentWall.elements.filter(element => !element.equals(this.element));
    }
  }

  override undo(): void {
    if(this.parentWall){
      this.parentWall.elements.push(this.element);
    }
  }
}
