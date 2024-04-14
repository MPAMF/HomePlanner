import {Point} from "./point";
import {Clickable, ClickableState} from "./interfaces/clickable";
import {Canvas, DrawOn} from "./canvas";
import {Utils} from "../modules/utils";
import {Cloneable} from "./interfaces/cloneable";

export abstract class WallElement extends Clickable implements Cloneable<WallElement> {
  protected constructor(
    public p1: Point,
    public p2: Point,
    protected parentWallP1: Point,
    protected parentWallP2: Point,
    protected defaultLength: number,
    protected defaultThickness: number,
    protected defaultColor: string,
    protected defaultSelectedColor: string,
    protected thickness?: number,
    protected color?: string,
    protected selectedColor?: string,
    protected length?: number,
    public isFinalized: boolean = false,
    protected isRotated: boolean = false
  ) {
    super();
  }

  /**
   * Get the wall thickness or the default one
   */
  getThickness(): number {
    return this.thickness ?? this.defaultThickness;
  }

  /**
   * Set the thickness of the wall
   * @param newThickness the new thickness of the wall
   */
  setThickness(newThickness: number): void {
    this.thickness = newThickness;
  }

  /**
   * Get the wall color or the default one
   */
  override getColor(): string {
    switch (this.state) {
      case ClickableState.NONE:
        return this.color ?? this.defaultColor;

      default:
        return this.selectedColor ?? this.defaultSelectedColor;
    }
  }

  /**
   * Set the color of the wall element
   * @param newColor the new color
   */
  setColor(newColor: string): void {
    this.color = newColor;
  }

  getLength(): number {
    return this.length ?? this.defaultLength;
  }

  /**
   * Set the length of the wall element
   * @param newLength new length
   */
  setLength(newLength: number): void {
    this.length = newLength;
  }

  override applyOnClickableRecursive(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean {
    return fn(this);
  }

  abstract clone() : WallElement;

  abstract restore(element: WallElement) : void;

  abstract update(newOriginPoint: Point): void;
}

export class Wall extends Clickable implements Cloneable<Wall> {

  constructor(
    public p1: Point,
    public p2: Point,
    private defaultThickness: number,
    private defaultColor: string,
    private defaultSelectedColor: string,
    private thickness?: number,
    private color?: string,
    private selectedColor?: string,
    public elements: WallElement[] = [],
    public isFinalized: boolean = false
  ) {
    super();
  }

  /**
   * Get the wall thickness or the default one
   */
  getThickness(): number {
    return this.thickness ?? this.defaultThickness;
  }

  /**
   * Set the thickness of the wall
   * @param newThickness the new thickness of the wall
   */
  setThickness(newThickness: number): void {
    this.thickness = newThickness;
  }

  /**
   * Get the wall color or the default one
   */
  override getColor(): string {
    switch (this.state) {
      case ClickableState.NONE:
        return this.color ?? this.defaultColor;

      default:
        return this.selectedColor ?? this.defaultSelectedColor;
    }
  }

  /**
   * Set the color of the wall
   * @param newColor the new color
   */
  setColor(newColor: string): void {
    this.color = newColor;
  }

  /**
   * Add a wall element to the wall
   * @param element the new ellement to add
   */
  addElement(element: WallElement): void {
    this.elements.push(element);
  }

  /**
   * Remove a wall element from the wall
   * @param element the wall to remove
   */
  removeElement(element: WallElement): void {
    const index = this.elements.findIndex(el => el.equals(element));
    if (index !== -1) {
      this.elements.splice(index, 1);
    }
  }

  /**
   * Calculate the angle with another wall (range from 0 to 360)
   * @param otherWall The second wall use to calculate the angle
   */
  calculateAngleWith(otherWall: Wall): number {
    return this.calculateAngleWithTwoPoint(otherWall.p1, otherWall.p2);
  }

  /**
   * Calculate the angle with a vector created with the given points (range from 0 to 360)
   * @param point1 The first point of the vector
   * @param point2 The second point of the vector
   */
  calculateAngleWithTwoPoint(point1: Point, point2: Point): number {
    return Utils.ConvertAngleToDegrees(Utils.CalculateAngle(this.p1, this.p2, point1, point2));
  }

  /**
   * Calculate the length of the wall
   */
  length(): number {
    return this.p1.distanceTo(this.p2);
  }

  /**
   * Calculate the midpoint of the wall
   */
  midpoint(): Point {
    return new Point((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2);
  }

  /**
   * Check if two walls are collinear
   * @param other the possible wall which is collinear
   */
  isCollinearWith(other: Wall): boolean {
    const crossProduct =
      (this.p2.y - this.p1.y) * (other.p2.x - other.p1.x) - (this.p2.x - this.p1.x) * (other.p2.y - other.p1.y);
    return Math.abs(crossProduct) < Number.EPSILON;
  }

  /**
   * Return the vector of the wall
   */
  getVector(): Point {
    return new Point(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
  }

  /**
   * Clone the wall to create a new instance with the same points
   */
  clone(): Wall {
    return new Wall(this.p1.clone(), this.p2.clone(), this.defaultThickness, this.defaultColor, this.defaultSelectedColor, this.thickness,
      this.color, this.selectedColor, this.elements.map(el => el.clone()), this.isFinalized);
  }

  restore(wall: Wall) {
    this.p1 = wall.p1;
    this.p2 = wall.p2;
    this.defaultThickness = wall.defaultThickness;
    this.defaultColor = wall.defaultColor;
    this.defaultSelectedColor = wall.defaultSelectedColor;
    this.thickness = wall.thickness;
    this.color = wall.color;
    this.selectedColor = wall.selectedColor;
    this.elements = wall.elements.map(el => el.clone());
    this.isFinalized = wall.isFinalized;
  }

  override isPointOnElement(point: Point): boolean {
    const delta: number = this.getThickness() / 2;
    const isP1OverP2: boolean = this.p1.y < this.p2.y;
    const isP1LeftP2: boolean = this.p1.x < this.p2.x;

    const deltaA: number = (isP1OverP2 && isP1LeftP2) || (!isP1OverP2 && !isP1LeftP2) ? delta : -delta;
    const A: Point = new Point(this.p1.x + deltaA, this.p1.y - delta);
    const B: Point = new Point(this.p1.x - deltaA, this.p1.y + delta);
    const C: Point = new Point(this.p2.x - deltaA, this.p2.y + delta);
    const D: Point = new Point(this.p2.x + deltaA, this.p2.y - delta);

    if (isP1LeftP2) {
      return (point.isLeft(D, A) && point.isLeft(C, D) && point.isLeft(B, C) && point.isLeft(A, B));
    }

    return (point.isLeft(B, A) && point.isLeft(C, B) && point.isLeft(D, C) && point.isLeft(A, D));
  }

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    const ctx = !this.isFinalized ? canvas.snappingLine : canvas.background;

    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.lineWidth = this.getThickness();
    ctx.strokeStyle = this.getColor();
    ctx.lineCap = "round";
    ctx.stroke();

    this.elements.forEach(element => element.draw(canvas, on));
  }

  override onSelect(): void {
  }

  override onUnselect(): void {
  }

  override onHover(): void {
  }

  override onHoverOut(): void {
  }

  override onDrag(offset: Point, recursive: boolean) {
    this.p1 = this.p1.translatePoint(offset);
    this.p2 = this.p2.translatePoint(offset);
    if (!recursive) {
      return;
    }
    this.elements.forEach(element => element.onDrag(offset, recursive));
  }

  override applyOnClickableRecursive(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean {
    for (const element of this.elements) {
      const mustExecutionContinue: boolean = element.applyOnClickableRecursive(canvas, fn)
      if (!mustExecutionContinue) return false;
    }

    return fn(this);
  }

  /**
   * Get the last wall-element added in the wall
   */
  public getLastWallElement(): WallElement | undefined {
    return this.elements.length === 0 ? undefined : this.elements[this.elements.length - 1];
  }

  /**
   * Calculate the position of the orthogonal projection onto a Wall
   * @param point The point to project
   * @return the projection of the point
   */
  projectOrthogonallyOntoWall(point: Point): Point {
    const segmentVector = new Point(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
    const pointVector = this.p1.getVector(point);

    // Calculation of the projection of the pointVector onto the segmentVector
    const projectionMagnitude = (pointVector.x * segmentVector.x + pointVector.y * segmentVector.y) / this.length() ** 2;
    const projection = new Point(segmentVector.x * projectionMagnitude, segmentVector.y * projectionMagnitude);

    // Add the projection at the beginning of the segment to obtain the coordinates of the projected point
    return new Point(this.p1.x + projection.x, this.p1.y + projection.y);
  }
}
