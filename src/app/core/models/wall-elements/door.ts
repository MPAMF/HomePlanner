import {WallElement} from "../wall";
import {Canvas, DrawOn} from "../canvas";


export class Door extends WallElement {

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    //console.log(`Drawing Door from (${this.p1.x}, ${this.p1.y}) to (${this.p2.x}, ${this.p2.y})`);
  }
}
