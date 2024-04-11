import {WallElement} from "../wall";
import {Canvas, DrawOn} from "../canvas";
import {Point} from "../point";
import {Utils} from "../../modules/utils";

export class Window extends WallElement {

  private p3: Point = new Point();
  private p4: Point = new Point();

  constructor(
    p1: Point,
    parentWallP1: Point,
    parentWallP2: Point,
    angleInDegreesWithUnitaryVector: number,
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
    super(p1, new Point(), parentWallP1, parentWallP2, angleInDegreesWithUnitaryVector, defaultLength, defaultThickness, defaultColor,
      defaultSelectedColor, thickness, color, selectedColor, length, isFinalized);

    this.calculatePointPositions();
  }

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    const ctx = !this.isFinalized ? canvas.snappingLine : canvas.background; //ToDo

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
    return new Window(this.p1.clone(), this.parentWallP1, this.parentWallP2, this.angleInDegreesWithUnitaryVector, this.defaultLength, this.defaultThickness,
      this.defaultColor, this.defaultSelectedColor, this.thickness, this.color, this.selectedColor, this.length, this.isFinalized);
  }

  restore(element: WallElement): void {
    if (!(element instanceof Window)) {
      return;
    }
    this.p1 = element.p1;
    this.p2 = element.p2;
  }

  calculatePointPositions(): void {
    // Calculate measure
    const ADLength: number = this.getLength() / 2;
    const ADCAngle: number = 2 * Math.PI / 3;
    const BDCAngle: number = Math.PI / 3;

    // Calculate position
    const parentWallLength: number = this.parentWallP1.distanceTo(this.parentWallP2);
    const unitDistance: number = this.getLength() / parentWallLength;

    const Cx: number = this.p1.x  + unitDistance * (this.parentWallP2.x - this.parentWallP1.x);
    const Cy: number = this.p1.y + unitDistance * (this.parentWallP2.y - this.parentWallP1.y);
    this.p2 = new Point(Cx, Cy);

    let angleInDegreesWithUnitaryVector: number = Utils.CalculateAngle(this.p1, new Point(Cx, Cy), new Point(0, 0), new Point(1, 0));
    angleInDegreesWithUnitaryVector = this.parentWallP1.y >= this.parentWallP2.y ? angleInDegreesWithUnitaryVector : (-angleInDegreesWithUnitaryVector);

    console.log(Math.cos(ADCAngle + angleInDegreesWithUnitaryVector))
    console.log(Utils.ConvertAngleToDegrees(angleInDegreesWithUnitaryVector))

    const Ax: number = this.p1.x + Math.cos(ADCAngle + angleInDegreesWithUnitaryVector) * ADLength;
    const Ay: number = this.p1.y + Math.sin(ADCAngle + angleInDegreesWithUnitaryVector) * ADLength;
    this.p3 = new Point(Ax, Ay);

    const Bx: number = Cx + Math.cos(BDCAngle + angleInDegreesWithUnitaryVector) * ADLength;
    const By: number = Cy + Math.sin(BDCAngle + angleInDegreesWithUnitaryVector) * ADLength;
    this.p4 = new Point(Bx, By);
  }
}
