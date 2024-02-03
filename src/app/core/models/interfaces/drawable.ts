import {Canvas, DrawOn} from "../canvas";

export interface Drawable {

  /**
   * Draw the element on the canvas
   * @param canvas The rendering canvas which is modified
   * @param on The state which specify on which canvas to draw
   */
  draw(canvas: Canvas, on: DrawOn): void;
}
