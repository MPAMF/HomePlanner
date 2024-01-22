import {Point} from "./point";

export interface Drawable {

  /**
   * Draw the element on the canvas
   * @param ctx The rendering canvas which is modified
   */
  draw(ctx: CanvasRenderingContext2D): void;
}

export interface Clickable {

  /**
   * Return true if the point is near to the wall
   * @param ctx The rendering canvas which is modified
   * @param point The point to check
   * @param isAWallSelected is a wall selected
   */
  isPointNear(ctx: CanvasRenderingContext2D, point: Point, isAWallSelected: boolean): boolean;
}
