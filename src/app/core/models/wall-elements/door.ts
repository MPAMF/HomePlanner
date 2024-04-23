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
    if(this.p3){
      const ctx = !this.isFinalized ? canvas.snappingLine : canvas.background;

      const angleUnitaryVector: number = Utils.CalculateTrigonometricAngleWithUnitXVector(this.p1, this.p2);

      ctx.beginPath();
      ctx.moveTo(this.p3.x, this.p3.y);
      ctx.lineTo(this.p1.x, this.p1.y);
      ctx.lineTo(this.p2.x, this.p2.y);


      ctx.moveTo(this.p2.x, this.p2.y);
      ctx.arc(this.p1.x, this.p1.y, this.getLength(),angleUnitaryVector, angleUnitaryVector + Math.PI/2, false);
      ctx.lineWidth = this.getThickness();
      ctx.strokeStyle = this.getColor();
      ctx.lineCap = "round";
      ctx.stroke();
    }
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

  clone(): Door {
    return new Door(this.p1.clone(), this.parentWallP1, this.parentWallP2, this.defaultLength,
      this.defaultThickness, this.defaultColor, this.defaultSelectedColor, this.thickness, this.color, this.selectedColor,
      this.length, this.isFinalized);
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
    const ADCAngle: number = Math.PI / 2;

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

    let angleInDegreesWithUnitaryVector: number = Utils.CalculateLeftAngle(startPoint, new Point(Cx, Cy), Point.ORIGIN, Point.UNIT_X);
    angleInDegreesWithUnitaryVector = this.parentWallP1.y >= this.parentWallP2.y ? angleInDegreesWithUnitaryVector : (-angleInDegreesWithUnitaryVector);

    const Ax: number = startPoint.x + Math.cos(ADCAngle + angleInDegreesWithUnitaryVector) * this.getLength();
    const Ay: number = startPoint.y + Math.sin(ADCAngle + angleInDegreesWithUnitaryVector) * this.getLength();
    this.p3 = this.isRotated ? new Point(-Ax, -Ay) : new Point(Ax, Ay);

  }

  getActionsButtonOptions(point: Point): ActionsButtonOptions {
    return new ActionsButtonOptions();
  }

  setVisibleState(newState: boolean): void {
  }
}
