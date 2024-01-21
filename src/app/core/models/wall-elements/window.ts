import {WallElement} from "../wall";
import {Canvas, DrawOn} from "../canvas";

export class Window extends WallElement {

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    //console.log(`Drawing Window from (${this.p1.x}, ${this.p1.y}) to (${this.p2.x}, ${this.p2.y})`);
  }

}
