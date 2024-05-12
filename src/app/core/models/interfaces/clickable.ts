import {Comparable} from "./comparable";
import {Point} from "../point";
import {Drawable} from "./drawable";
import {ActionsButtonOptions} from "../action-button-options";
import {Canvas, DrawOn} from "../canvas";

export enum ClickableState {
  NONE,
  SELECTED,
  HOVERED
}

export abstract class Clickable extends Comparable implements Drawable {

  protected state: ClickableState = ClickableState.NONE;

  protected isVisible: boolean = true;

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
   * Get the wall color or the default one, depending on the state
   */
  abstract getDrawColor(): string;

  /**
   * Get the wall color
   */
  abstract getColor(): string|undefined;

  /**
   * Get the wall selected color
   */
  abstract getSelectedColor(): string|undefined;

  /**
   * Set the wall color
   * @param color The new color
   */
  abstract setColor(color?: string): void;

  /**
   * Set the wall selected color
   * @param color The new color
   */
  abstract setSelectedColor(color?: string): void;

  /**
   * Method call when the clickable turns to selected
   */
  abstract onSelect(): void;

  /**
   * Method call when the clickable was selected and turn to another state
   */
  abstract onUnselect(): void;

  /**
   * Method call when the clickable turns to hovered
   */
  abstract onHover(): void;

  /**
   * Method call when the clickable was hovered and turn to another state
   */
  abstract onHoverOut(): void;

  /**
   * Get option of the actions button component
   * @param point The position of the click
   */
  abstract getActionsButtonOptions(point: Point): ActionsButtonOptions;

  /**
   * Set the clickable visible status
   * @param newState the new visible status
   */
  abstract setVisibleState(newState: boolean): void;

  /**
   * Method call when the clickable is dragged
   * @param offset The offset of the drag
   * @param recursive true if the drag is recursive (all the children are dragged)
   */
  abstract onDrag(offset: Point, recursive: boolean): void;

  /**
   * Update the attribute state
   * @param newState The new state
   * @retrun true if the state is changed
   */
  public setState(newState: ClickableState): boolean {
    switch (this.state) {
      case ClickableState.NONE:
        if (newState == ClickableState.NONE) return false;
        this.state = newState;

        switch (newState) {
          case ClickableState.SELECTED:
            this.onSelect();
            break;
          case ClickableState.HOVERED:
            this.onHover()
            break;
        }
        break;

      case ClickableState.SELECTED:
        if (newState != ClickableState.NONE) return false;
        this.state = ClickableState.NONE;
        this.onUnselect();
        break;

      case ClickableState.HOVERED:
        if (newState == ClickableState.HOVERED) return false;
        this.state = newState;

        if (newState == ClickableState.SELECTED) {
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
   * @param stateToReset (optional) reset just clickable with this state
   */
  public resetState(stateToReset?: ClickableState): boolean {
    if (stateToReset && stateToReset != this.state) {
      return false;
    }

    switch (this.state) {
      case ClickableState.NONE:
        return false;

      case ClickableState.SELECTED:
        this.onUnselect();
        break;

      case ClickableState.HOVERED:
        this.onHoverOut();
        break;

      default:
        throw new Error("Method not implemented.");
    }

    this.state = ClickableState.NONE;
    return true;
  }

  /**
   * Get the clickable state
   */
  public getState(): ClickableState {
    return this.state;
  }

  /**
   * Get the visible status
   */
  public getVisibleState(): boolean {
    return this.isVisible;
  }

  draw(canvas: Canvas, on: DrawOn): void {
  }
}
