import {WallElement} from "../wall";
import {Canvas, DrawOn} from "../canvas";
import {Point} from "../point";


export class Door extends WallElement {

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    //console.log(`Drawing Door from (${this.p1.x}, ${this.p1.y}) to (${this.p2.x}, ${this.p2.y})`);
  }

  isPointOnElement(point: Point): boolean {
    return false;
  }

  onDrag(offset: Point, recursive: boolean): void {
  }

  onHover(): void {
  }

  onHoverOut(): void {
  }

  onSelect(): void {
  }

  onUnselect(): void {
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
}
