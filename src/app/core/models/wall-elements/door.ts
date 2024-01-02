import {WallElement} from "../wall";
import {Point} from "../point";


export class Door extends WallElement {

  override draw(ctx: CanvasRenderingContext2D, offset: Point) {
    //console.log(`Drawing Door from (${this.p1.x}, ${this.p1.y}) to (${this.p2.x}, ${this.p2.y})`);
  }
}
