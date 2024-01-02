import {Point} from "./point";

export interface Drawable {
  draw(ctx: CanvasRenderingContext2D, offset: Point): void;
}
