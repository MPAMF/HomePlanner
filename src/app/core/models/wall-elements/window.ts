import {Canvas, DrawOn} from "../canvas";
import {Point} from "../point";
import {Utils} from "../../modules/utils";
import {WallElement} from "../wall-element";

export class Window extends WallElement {

  private p3: Point | undefined;
  private p4: Point | undefined;

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
    if (!this.p3 || !this.p4) {
      return;
    }
    const ctx = !this.isFinalized ? canvas.snappingLine : canvas.background;

    ctx.beginPath();
    ctx.moveTo(this.p3.x, this.p3.y);
    ctx.lineTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.lineTo(this.p4.x, this.p4.y);
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
    if (!this.p3 || !this.p4) {
      return false;
    }

    const delta: number = (this.getThickness() + this.getLength()) / 3;
    let angleUnitaryVector: number = Utils.CalculateTrigonometricAngleWithUnitXVector(this.p1, this.p2);

    const midPointP1: Point = this.p1.midpointTo(this.p3);
    const midPointP2: Point = this.p2.midpointTo(this.p4);

    const alpha: Point = new Point(midPointP1.x - Math.cos(angleUnitaryVector) * delta, midPointP1.y - Math.sin(angleUnitaryVector) * delta);
    const beta: Point = new Point(midPointP2.x + Math.cos(angleUnitaryVector) * delta, midPointP2.y + Math.sin(angleUnitaryVector) * delta);

    angleUnitaryVector += Math.PI / 2;
    const A: Point = new Point(alpha.x + Math.cos(angleUnitaryVector) * delta, alpha.y + Math.sin(angleUnitaryVector) * delta);
    const B: Point = new Point(beta.x + Math.cos(angleUnitaryVector) * delta, beta.y + Math.sin(angleUnitaryVector) * delta);
    const C: Point = new Point(beta.x - Math.cos(angleUnitaryVector) * delta, beta.y - Math.sin(angleUnitaryVector) * delta);
    const D: Point = new Point(alpha.x - Math.cos(angleUnitaryVector) * delta, alpha.y - Math.sin(angleUnitaryVector) * delta);

    return (point.isLeft(D, A) && point.isLeft(C, D) && point.isLeft(B, C) && point.isLeft(A, B));
  }

  override onDrag(offset: Point, recursive: boolean): void {
    this.update(this.p1.translatePoint(offset), true);
  }

  override onSelect(): void {
  }

  override onUnselect(): void {
  }

  override onHover(): void {
  }

  override onHoverOut(): void {
  }

  clone(): Window {
    return new Window(this.p1.clone(), this.parentWallP1, this.parentWallP2, this.defaultLength, this.defaultThickness,
      this.defaultColor, this.defaultSelectedColor, this.isFinalized, this.thickness, this.color, this.selectedColor, this.length);
  }

  restore(element: Window): void {
    this.parentWallP1 = element.parentWallP1;
    this.parentWallP2 = element.parentWallP2;
    this.update(element.p1, true);
  }

  calculatePointPositions(startPoint: Point): void {
    // Calculate measure
    const ADLength: number = this.getLength() / 2;
    const ADCAngle: number = 2 * Math.PI / 3;
    const BCDAngle: number = Math.PI / 3;

    // Calculate position
    const parentWallLength: number = this.parentWallP1.distanceTo(this.parentWallP2);
    const unitDistance: number = this.getLength() / parentWallLength;

    const Cx: number = startPoint.x  + unitDistance * (this.parentWallP2.x - this.parentWallP1.x);
    const Cy: number = startPoint.y + unitDistance * (this.parentWallP2.y - this.parentWallP1.y);
    const calculatedP2: Point = new Point(Cx, Cy);

    // Check if the point is on the wall
    if(!calculatedP2.isPointBetweenTwoPoint(this.parentWallP1, this.parentWallP2)){
      return;
    }
    const angleInDegreesWithUnitaryVector: number = Utils.CalculateTrigonometricAngleWithUnitXVector(startPoint, calculatedP2);

    let rotationMultiplier: number = 1;
    let finalBCDAngle, finalADCAngle: number;
    if( this.isRotated ){
      rotationMultiplier *= -1
      finalADCAngle = angleInDegreesWithUnitaryVector + BCDAngle;
      finalBCDAngle = angleInDegreesWithUnitaryVector + ADCAngle;
    } else {
      finalADCAngle = angleInDegreesWithUnitaryVector + ADCAngle;
      finalBCDAngle = angleInDegreesWithUnitaryVector + BCDAngle;
    }

    const Ax: number = startPoint.x + rotationMultiplier * Math.cos(finalADCAngle) * ADLength;
    const Ay: number = startPoint.y + rotationMultiplier * Math.sin(finalADCAngle) * ADLength;

    const Bx: number = Cx + rotationMultiplier * Math.cos(finalBCDAngle) * ADLength;
    const By: number = Cy + rotationMultiplier * Math.sin(finalBCDAngle) * ADLength;

    this.p1 = startPoint;
    this.p2 = calculatedP2;
    this.p3 = new Point(Ax, Ay);
    this.p4 = new Point(Bx, By);
  }

  update(newOriginPoint: Point, needProjectOrthogonally: boolean = false): void {
    if (needProjectOrthogonally){
      newOriginPoint = Utils.projectOrthogonallyOntoSegment(this.parentWallP1, this.parentWallP2, newOriginPoint);
    }
    if(!newOriginPoint.isPointBetweenTwoPoint(this.parentWallP1, this.parentWallP2)){
      return;
    }

    this.calculatePointPositions(newOriginPoint);
  }

  setVisibleState(newState: boolean): void {
  }

}
