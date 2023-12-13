import {Wall} from "./wall";
import {Drawable} from "./drawable";

export class Editor implements Drawable {
    constructor(public walls: Wall[]) {
    }

    draw(ctx: CanvasRenderingContext2D) {
        console.log("Drawing Room");
        this.walls.forEach(wall => wall.draw(ctx));
    }
}
