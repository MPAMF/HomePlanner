import {WallElement} from "../wall";


export class Door extends WallElement {

  override draw(ctx: CanvasRenderingContext2D) {
    console.log(`Drawing Door from (${this.p1.x}, ${this.p1.y}) to (${this.p2.x}, ${this.p2.y})`);
  }
}