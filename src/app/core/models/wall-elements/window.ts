import {WallElement} from "../wall";
import {Canvas, DrawOn} from "../canvas";
import {Point} from "../point";
import {Utils} from "../../modules/utils";

export class Window extends WallElement {

  constructor(
    p1: Point,
    private directingCoefficient: number,
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
    super(p1, new Point(), angleInDegreesWithUnitaryVector, defaultLength, defaultThickness, defaultColor,
      defaultSelectedColor, thickness, color, selectedColor, length, isFinalized);
  }

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    const ctx = !this.isFinalized ? canvas.snappingLine : canvas.background; //ToDo

    // Calculate measure
    const ADLength: number = this.getLength() / 2;
    const ADCAngle: number = 2 * Math.PI / 3;
    const BDCAngle: number = Math.PI / 3;

    // Calculate position
    const Cx: number = this.p1.x + this.getLength();
    const Cy: number = Utils.CalculateAffineFunction(this.directingCoefficient, this.getLength(), this.p1.y);

    const angleInDegreesWithUnitaryVector: number = Utils.CalculateAngle(this.p1, new Point(Cx, Cy), new Point(0, 0), new Point(1, 0));

    const Ax: number = this.p1.x + Math.cos(ADCAngle + angleInDegreesWithUnitaryVector) * ADLength;
    const Ay: number = this.p1.y + Math.sin(ADCAngle + angleInDegreesWithUnitaryVector) * ADLength;

    const Bx: number = Cx + Math.cos(BDCAngle + angleInDegreesWithUnitaryVector) * ADLength;
    const By: number = Cy + Math.sin(BDCAngle + angleInDegreesWithUnitaryVector) * ADLength;

    ctx.beginPath();
    ctx.moveTo(Ax, Ay);
    ctx.lineTo(this.p1.x, this.p1.y);
    ctx.lineTo(Cx, Cy);
    ctx.lineTo(Bx, By);
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
    return new Window(this.p1.clone(), this.directingCoefficient, this.angleInDegreesWithUnitaryVector, this.defaultLength, this.defaultThickness,
      this.defaultColor, this.defaultSelectedColor, this.thickness, this.color, this.selectedColor, this.length, this.isFinalized);
  }

  restore(element: WallElement): void {
    if (!(element instanceof Window)) {
      return;
    }
    this.p1 = element.p1;
    this.p2 = element.p2;
  }
}
