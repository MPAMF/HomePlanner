import {Canvas, DrawOn} from "../canvas";
import {Point} from "../point";
import {Utils} from "../../modules/utils";
import {WallElement} from "../interfaces/wall-elements";
import {ActionsButtonOptions} from "../action-button-options";


export class Door extends WallElement {

  private p3: Point | undefined;

  constructor(
    p1: Point,
    parentWallP1: Point,
    parentWallP2: Point,
    defaultLength: number,
    defaultThickness: number,
    defaultColor: string,
    defaultSelectedColor: string,
    isFinalized: boolean = false,
    thickness?: number,
    color?: string,
    selectedColor?: string,
    length?: number,
  ) {
    super(p1, p1, parentWallP1, parentWallP2, defaultLength, defaultThickness, defaultColor,
      defaultSelectedColor, thickness, color, selectedColor, length, isFinalized);

    this.calculatePointPositions(p1);
  }

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    if (!this.p3) {
      return;
    }
    const ctx = !this.isFinalized ? canvas.snappingLine : canvas.background;
    const angleUnitaryVector: number = Utils.CalculateTrigonometricAngleWithUnitXVector(this.p1, this.p2);
    ctx.beginPath();
    ctx.moveTo(this.p3.x, this.p3.y);
    ctx.lineTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.moveTo(this.p2.x, this.p2.y);
    ctx.arc(this.p1.x, this.p1.y, this.getLength(), angleUnitaryVector, angleUnitaryVector + Math.PI / 2, false);
    ctx.lineWidth = this.getThickness();
    ctx.strokeStyle = this.getDrawColor();
    ctx.lineCap = "round";
    ctx.stroke();
  }

  /**
   * Create a rectangle around the window and check if the given point is into the rectangle
   * @param point The point to check
   * @return
   */
  isPointOnElement(point: Point): boolean {
    if (!this.p3) {
      return false;
    }

    let delta: number = this.getThickness();
    let angleUnitaryVector: number = Utils.CalculateTrigonometricAngleWithUnitXVector(this.p1, this.p2);
    const p4x: number = this.p2.x + Math.cos(Math.PI/2 + angleUnitaryVector) * this.getLength();
    const p4y: number = this.p2.y + Math.sin(Math.PI/2 + angleUnitaryVector) * this.getLength();
    const p4: Point = this.isRotated ? new Point(-p4x, -p4y) : new Point(p4x, p4y);

    const midPointP1: Point = this.p1.midpointTo(this.p3);
    const midPointP2: Point = this.p2.midpointTo(p4);

    const alpha: Point = new Point(midPointP1.x - Math.cos(angleUnitaryVector) * delta, midPointP1.y - Math.sin(angleUnitaryVector) * delta);
    const beta: Point = new Point(midPointP2.x + Math.cos(angleUnitaryVector) * delta, midPointP2.y + Math.sin(angleUnitaryVector) * delta);

    delta += this.getLength() / 2;
    angleUnitaryVector += Math.PI / 2;
    const A: Point = new Point(alpha.x + Math.cos(angleUnitaryVector) * delta, alpha.y + Math.sin(angleUnitaryVector) * delta);
    const B: Point = new Point(beta.x + Math.cos(angleUnitaryVector) * delta, beta.y + Math.sin(angleUnitaryVector) * delta);
    const C: Point = new Point(beta.x - Math.cos(angleUnitaryVector) * delta, beta.y - Math.sin(angleUnitaryVector) * delta);
    const D: Point = new Point(alpha.x - Math.cos(angleUnitaryVector) * delta, alpha.y - Math.sin(angleUnitaryVector) * delta);

    return (point.isLeft(D, A) && point.isLeft(C, D) && point.isLeft(B, C) && point.isLeft(A, B));
  }

  override onDrag(offset: Point, recursive: boolean): void {
    this.p1 = this.p1.translatePoint(offset);
    this.p2 = this.p2.translatePoint(offset);
    this.p3 = this.p3?.translatePoint(offset);
  }

  override onHover(): void {
  }

  override onHoverOut(): void {
  }

  override onSelect(): void {
  }

  override onUnselect(): void {
  }

  clone(): Door {
    return new Door(this.p1.clone(), this.parentWallP1, this.parentWallP2, this.defaultLength,
      this.defaultThickness, this.defaultColor, this.defaultSelectedColor, this.isFinalized,
      this.thickness, this.color, this.selectedColor, this.length);
  }

  restore(element: Door): void {
    this.p1 = element.p1;
    this.p2 = element.p2;
  }

  update(newOriginPoint: Point): void {
    this.calculatePointPositions(newOriginPoint);
  }

  calculatePointPositions(startPoint: Point): void {
    // Calculate measure
    const ACDAngle: number = Math.PI / 2;

    // Calculate position
    const parentWallLength: number = this.parentWallP1.distanceTo(this.parentWallP2);
    const unitDistance: number = this.getLength() / parentWallLength;

    const Cx: number = startPoint.x  + unitDistance * (this.parentWallP2.x - this.parentWallP1.x);
    const Cy: number = startPoint.y + unitDistance * (this.parentWallP2.y - this.parentWallP1.y);
    const C: Point = new Point(Cx, Cy);

    // Check if the point is on the wall
    if(!C.isPointBetweenTwoPoint(this.parentWallP1, this.parentWallP2)){
      return;
    }

    this.p1 = startPoint;
    this.p2 = new Point(Cx, Cy);

    const angleInDegreesWithUnitaryVector: number = Utils.CalculateTrigonometricAngleWithUnitXVector(startPoint, new Point(Cx, Cy));
    const Ax: number = startPoint.x + Math.cos(ACDAngle + angleInDegreesWithUnitaryVector) * this.getLength();
    const Ay: number = startPoint.y + Math.sin(ACDAngle + angleInDegreesWithUnitaryVector) * this.getLength();
    this.p3 = this.isRotated ? new Point(-Ax, -Ay) : new Point(Ax, Ay);
  }

  override setVisibleState(newState: boolean): void {
  }

}
