import {WallElement} from "../wall";

export class Window extends WallElement {

    override draw(ctx: CanvasRenderingContext2D) {
        console.log(`Drawing Window from (${this.p1.x}, ${this.p1.y}) to (${this.p2.x}, ${this.p2.y})`);
    }

}
