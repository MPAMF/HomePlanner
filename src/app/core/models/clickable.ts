import {Comparable} from "./comparable";
import {Point} from "./point";
import {Drawable} from "./drawable";
import {Canvas, DrawOn} from "./canvas";

export enum ClickableSate {
  NONE,
  SELECTED,
  HOVERED
}

export abstract class Clickable extends Comparable implements Drawable {

  protected state: ClickableSate = ClickableSate.NONE;

  protected constructor() {
    super();
  }

  /**
   * Apply a function on the children and the current element
   * @param canvas the canvas
   * @param fn the function
   * @return false if the execution must stop
   */
  abstract applyOnClickableRecursive(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean;

  /**
   * Return true if the point is near to the element
   * @param point The point to check
   */
  abstract isPointOnElement(point: Point): boolean;

  /**
   * Get the wall color or the default one
   */
  abstract getColor(): string;

  /**
   * Method call when the clickable turns to selected
   */
  abstract onSelect(): void;

  /**
   * Method call when the clickable was selected and turn to an other state
   */
  abstract onUnselect(): void;

  /**
   * Method call when the clickable turns to hovered
   */
  abstract onHover(): void;

  /**
   * Method call when the clickable was hovered and turn to an other state
   */
  abstract onHoverOut(): void;

  /**
   * Update the attribute state
   * @param newState The new state
   * @retrun true if the state is changed
   */
  public setState(newState: ClickableSate): boolean {
    switch (this.state){
      case ClickableSate.NONE:
        if(newState == ClickableSate.NONE) return false;
        this.state = newState;

        switch (newState){
          case ClickableSate.SELECTED:
            this.onSelect();
            break;
          case ClickableSate.HOVERED:
            this.onHover()
            break;
        }
        break;

      case ClickableSate.SELECTED:
        if(newState != ClickableSate.NONE) return false;
        this.state = ClickableSate.NONE;
        this.onUnselect();
        break;

      case ClickableSate.HOVERED:
        if(newState == ClickableSate.HOVERED) return false;
        this.state = newState;

        if(newState == ClickableSate.SELECTED){
          this.onSelect();
        }
        this.onHoverOut();
        break;

      default:
          throw new Error("Method not implemented.");
    }

    return true;
  }

  /**
   * Reset the attribute state
   * @param stateToReset (optional) reset juste clickable with this state
   */
  public resetState(stateToReset?: ClickableSate): boolean{
    if(stateToReset && stateToReset != this.state){
      return false;
    }

    switch (this.state){
      case ClickableSate.NONE:
        return false;

      case ClickableSate.SELECTED:
        this.onUnselect();
        break;

      case ClickableSate.HOVERED:
        this.onHoverOut();
        break;

      default:
        throw new Error("Method not implemented.");
    }

    this.state = ClickableSate.NONE;
    return true;
  }

  /**
   * Get the clickable state
   */
  public getState(): ClickableSate {
    return this.state;
  }

  draw(canvas: Canvas, on: DrawOn): void {
  }
}
