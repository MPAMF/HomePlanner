import {Canvas, DrawOn} from "../canvas";
import {Point} from "../point";
import {WallElement} from "../interfaces/wall-elements";
import {ActionsButtonOptions} from "../action-button-options";


export class Door extends WallElement {

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    //console.log(`Drawing Door from (${this.p1.x}, ${this.p1.y}) to (${this.p2.x}, ${this.p2.y})`);
  }

  override isPointOnElement(point: Point): boolean {
    return false;
  }

  onDrag(offset: Point, recursive: boolean): void {
  }

  override onHover(): void {
  }

  override onHoverOut(): void {
  }

  override onSelect(): void {
  }

  override onUnselect(): void {
  }

  clone(): WallElement {
    return new Door(this.p1.clone(), this.p2.clone(), this.parentWallP1, this.parentWallP2, this.defaultLength,
      this.defaultThickness, this.defaultColor, this.defaultSelectedColor, this.thickness, this.color, this.selectedColor,
      this.length, this.isFinalized);
  }

  restore(element: WallElement): void {
    if (!(element instanceof Door)) {
      return;
    }
    this.p1 = element.p1;
    this.p2 = element.p2;
  }

  update(newOriginPoint: Point): void {
    this.p1 = newOriginPoint;
  }

  getActionsButtonOptions(point: Point): ActionsButtonOptions {
    return new ActionsButtonOptions();
  }

  setVisibleState(newState: boolean): void {
  }
}
