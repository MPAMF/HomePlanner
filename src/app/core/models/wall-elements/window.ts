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
    if(this.p3 && this.p4){
      const ctx = !this.isFinalized ? canvas.snappingLine : canvas.background;

      ctx.beginPath();
      ctx.moveTo(this.p3.x, this.p3.y);
      ctx.lineTo(this.p1.x, this.p1.y);
      ctx.lineTo(this.p2.x, this.p2.y);
      ctx.lineTo(this.p4.x, this.p4.y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = this.getColor();
      ctx.lineCap = "round";
      ctx.stroke();

      const delta: number = (this.getThickness() + this.getLength() / 2) / 2;
      const isP1OverP2: boolean = this.p1.y < this.p2.y;
      const isP1LeftP2: boolean = this.p1.x < this.p2.x;

      //const deltaA: number = (isP1OverP2 && isP1LeftP2) || (!isP1OverP2 && !isP1LeftP2) || (!isP1LeftP2 && isP1OverP2) ? delta : -delta;
      const A: Point = new Point(this.p3.x - delta, this.p3.y - delta);
      const B: Point = this.p3
      const C: Point = this.p4
      const D: Point = new Point(this.p4.x - delta, this.p4.y - delta);

      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.lineTo(C.x, C.y);
      ctx.lineTo(D.x, D.y);
      ctx.lineTo(A.x, A.y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = this.getColor();
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }

  isPointOnElement(point: Point): boolean {
    if(this.p3 && this.p4){
      const delta: number = (this.getThickness() + this.getLength()) / 2;
      const alpha: Point = new Point((this.p1.x + this.p3.x) / 2, (this.p1.y + this.p3.y) / 2);
      const beta: Point = new Point((this.p2.x + this.p4.x) / 2, (this.p2.y + this.p4.y) / 2);
      const isAlphaOverBeta: boolean = alpha.y < beta.y;
      const isAlphaLeftBeta: boolean = alpha.x < beta.x;

      const deltaA: number = (isAlphaOverBeta && isAlphaLeftBeta) || (!isAlphaOverBeta && !isAlphaLeftBeta) ? delta : -delta;
      const A: Point = new Point(alpha.x + deltaA, alpha.y - delta);
      const B: Point = new Point(alpha.x - deltaA, alpha.y + delta);
      const C: Point = new Point(beta.x - deltaA, beta.y + delta);
      const D: Point = new Point(beta.x + deltaA, beta.y - delta);

      if (isAlphaLeftBeta) {
        return (point.isLeft(D, A) && point.isLeft(C, D) && point.isLeft(B, C) && point.isLeft(A, B));
      }

      return (point.isLeft(B, A) && point.isLeft(C, B) && point.isLeft(D, C) && point.isLeft(A, D));
    }

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
    const BDCAngle: number = Math.PI / 3;

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

    let angleInDegreesWithUnitaryVector: number = Utils.CalculateAngle(startPoint, new Point(Cx, Cy), new Point(0, 0), new Point(1, 0));
    angleInDegreesWithUnitaryVector = this.parentWallP1.y >= this.parentWallP2.y ? angleInDegreesWithUnitaryVector : (-angleInDegreesWithUnitaryVector);

    const Ax: number = startPoint.x + Math.cos(ADCAngle + angleInDegreesWithUnitaryVector) * ADLength;
    const Ay: number = startPoint.y + Math.sin(ADCAngle + angleInDegreesWithUnitaryVector) * ADLength;
    this.p3 = this.isRotated ? new Point(-Ax, -Ay) : new Point(Ax, Ay);

    const Bx: number = Cx + Math.cos(BDCAngle + angleInDegreesWithUnitaryVector) * ADLength;
    const By: number = Cy + Math.sin(BDCAngle + angleInDegreesWithUnitaryVector) * ADLength;
    this.p4 = this.isRotated ? new Point(-Bx, -By) : new Point(Bx, By);
  }

  update(newOriginPoint: Point): void {
    this.calculatePointPositions(newOriginPoint);
  }
}
