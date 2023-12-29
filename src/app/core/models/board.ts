import {Wall} from "./wall";
import {Drawable} from "./drawable";

export class Board implements Drawable {
  public isDrawingWalls: boolean;
  public walls: Wall[];

  constructor() {
    this.isDrawingWalls = false;
    this.walls = [];
  }

  draw(ctx: CanvasRenderingContext2D) {
    console.log("Drawing Board");
    this.walls.forEach(wall => wall.draw(ctx));
  }
}
