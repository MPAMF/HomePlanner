import {Canvas, DrawOn} from "../canvas";
import {Point} from "../point";
import {Utils} from "../../modules/utils";
import {WallElement} from "../interfaces/wall-elements";

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
    thickness?: number,
    color?: string,
    selectedColor?: string,
    length?: number,
    isFinalized: boolean = false
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
    ctx.strokeStyle = this.getColor();
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
    let angleUnitaryVector: number = Utils.CalculateAngle(this.p1, this.p2, new Point(0, 0), new Point(1, 0));
    angleUnitaryVector = this.p1.y >= this.p2.y ? angleUnitaryVector : (-angleUnitaryVector);

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

  onDrag(offset: Point, recursive: boolean): void {
  }

  override onSelect(): void {
  }

  override onUnselect(): void {
  }

  override onHover(): void {
  }

  override onHoverOut(): void {
  }

  clone(): WallElement {
    return new Window(this.p1.clone(), this.parentWallP1, this.parentWallP2, this.defaultLength, this.defaultThickness,
      this.defaultColor, this.defaultSelectedColor, this.thickness, this.color, this.selectedColor, this.length, this.isFinalized);
  }

  restore(element: WallElement): void {
    if (!(element instanceof Window)) {
      return;
    }
    this.p1 = element.p1;
    this.p2 = element.p2;
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

    // Check if the point is on the wall
    const p1xSupP2x: boolean = (Cx >= this.parentWallP2.x) && (Cx <= this.parentWallP1.x);
    const p2xSupP1x: boolean = (Cx >= this.parentWallP1.x) && (Cx <= this.parentWallP2.x);

    const p1ySupP2y: boolean = (Cy >= this.parentWallP2.y) && (Cy <= this.parentWallP1.y);
    const p2ySupP1y: boolean = (Cy >= this.parentWallP1.y) && (Cy <= this.parentWallP2.y);

    const isCorrectlyPrintOnWall: boolean = (p1xSupP2x || p2xSupP1x) && (p1ySupP2y || p2ySupP1y);
    if(!isCorrectlyPrintOnWall){
      return;
    }
    this.p1 = startPoint;
    this.p2 = new Point(Cx, Cy);

    let rotationMultiplier: number = 1;
    let angleUnitaryVector: number = Utils.CalculateAngle(startPoint, new Point(Cx, Cy), new Point(0, 0), new Point(1, 0));
    angleUnitaryVector = this.parentWallP1.y >= this.parentWallP2.y ? angleUnitaryVector : (-angleUnitaryVector);

    let finalADCAngle: number;
    let finalBCDAngle: number;
    if(this.isRotated){
      rotationMultiplier *= -1
      finalADCAngle = angleUnitaryVector + BCDAngle;
      finalBCDAngle = angleUnitaryVector + ADCAngle;
    } else {
      finalADCAngle = angleUnitaryVector + ADCAngle;
      finalBCDAngle = angleUnitaryVector + BCDAngle;
    }

    const Ax: number = startPoint.x + rotationMultiplier * Math.cos(finalADCAngle) * ADLength;
    const Ay: number = startPoint.y + rotationMultiplier * Math.sin(finalADCAngle) * ADLength;
    this.p3 = new Point(Ax, Ay);

    const Bx: number = Cx + rotationMultiplier * Math.cos(finalBCDAngle) * ADLength;
    const By: number = Cy + rotationMultiplier * Math.sin(finalBCDAngle) * ADLength;
    this.p4 = new Point(Bx, By);
  }

  update(newOriginPoint: Point): void {
    this.calculatePointPositions(newOriginPoint);
  }
}
