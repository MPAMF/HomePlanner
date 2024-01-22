import {Canvas, DrawOn} from "./canvas";

export interface Drawable {
  draw(canvas: Canvas, on: DrawOn): void;
}
