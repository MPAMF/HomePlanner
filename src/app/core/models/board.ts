import {Wall} from "./wall";
import {Drawable} from "./drawable";

export class Board implements Drawable {
  public walls: Wall[];

  constructor() {
    this.walls = [];
  }

  draw(ctx: CanvasRenderingContext2D) {
    console.log("Drawing Board");
    this.walls.forEach(wall => wall.draw(ctx));
  }
}
