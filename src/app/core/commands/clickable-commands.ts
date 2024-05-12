import {Command} from "./command";
import {Wall} from "../models/wall";
import {Point} from "../models/point";
import {Room} from "../models/room";
import {DrawState} from "../models/draw-state";
import {DrawOn} from "../models/canvas";
import {Utils} from "../modules/utils";

export class HideClickableCommand extends Command {

  private previousVisibleSate: boolean = true;

  constructor(private wall: Wall) {
    super();
  }

  override do(): void {
    this.previousVisibleSate = this.wall.getVisibleState();
    this.wall.setVisibleState(!this.previousVisibleSate);
  }

  override undo(): void {
    this.wall.setVisibleState(this.previousVisibleSate);
  }
}
