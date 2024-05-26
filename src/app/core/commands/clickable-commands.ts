import {Command} from "./command";
import {Clickable} from "../models/interfaces/clickable";
import {WallElement} from "../models/wall-element";

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
