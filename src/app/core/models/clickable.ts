import {Comparable} from "./comparable";
import {Point} from "./point";
import {Drawable} from "./drawable";

export abstract class Clickable extends Comparable implements Drawable {
  protected constructor(
    public isSelected: boolean
  ) {
    super();
  }

  /**
   * Return true if the point is near to the element
   * @param point The point to check
   */
   abstract isPointOnElement(point: Point): boolean;

  /**
   * Apply a function on the children and the current element
   * @param ctx the canvas
   * @param fn the function
   * @return false if the execution must stop
   */
  abstract applyOnAllClickable(ctx: CanvasRenderingContext2D, fn: (clickable: Clickable) => boolean): boolean;

  /**
   * Reset the attribute isSelected
   * @retrun true if the state is changed
   */
  public resetSelectedState(): boolean {
    if(this.isSelected){
      this.isSelected = false;
      return true;
    }

    return false;
  }

  draw(ctx: CanvasRenderingContext2D): void {
  }
}
