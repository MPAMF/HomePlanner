
export interface Drawable {

  /**
   * Draw the element on the canvas
   * @param ctx The rendering canvas which is modified
   */
  draw(ctx: CanvasRenderingContext2D): void;
}
