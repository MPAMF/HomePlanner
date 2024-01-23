import {Point} from "./point";
import {Clickable} from "./clickable";
import {Canvas, DrawOn} from "./canvas";

export class WallElement extends Clickable {

  constructor(
    public p1: Point,
    public p2: Point,
    isSelected: boolean = false
  ) {
    super(isSelected);
  }

  isPointOnElement(point: Point): boolean {
    return false;
  }

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    // should be implemented in subclasses
    throw new Error("Method not implemented.");
  }

  // Calculate the length of the wall element
  length(): number {
    return this.p1.distanceTo(this.p2);
  }

  // Clone the wall element to create a new instance with the same points
  clone(): WallElement {
    return new WallElement(this.p1, this.p2);
  }

  applyOnClickableRecursive(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean {
    return fn(this);
  }

}

export class Wall extends Clickable {

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
    isSelected: boolean = false,
    public isFinalized: boolean = false
  ) {
    super(isSelected);
  }

  /**
   * Get the wall thickness or the default one
   */
  getThickness (): number {
    return this.thickness ?? this.defaultThickness;
  }

  /**
   * Set the thickness of the wall
   * @param newThickness the new thickness of the wall
   */
  setThickness (newThickness: number): void {
    this.thickness = newThickness;
  }

  /**
   * Get the wall color or the default one
   */
  getColor (): string {
    return  this.isSelected ? this.selectedColor ?? this.defaultSelectedColor : this.color ?? this.defaultColor;
  }

  /**
   * Set the color of the wall
   * @param newColor the new color
   */
  setColor (newColor: string): void {
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

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    const ctx = !this.isFinalized ? canvas.snappingLine : canvas.background;

    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.lineWidth = this.getThickness();
    ctx.strokeStyle = this.getColor();
    ctx.stroke();

    this.elements.forEach(element => element.draw(canvas, on));
  }

  /**
   * Calculate the angle with another wall
   * @param otherWall The second wall use to calculate the angle
   */
  calculateAngleWith(otherWall: Wall): number {
    const vector1 = new Point(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
    const vector2 = new Point(otherWall.p2.x - otherWall.p1.x, otherWall.p2.y - otherWall.p1.y);
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    const cosineTheta = vector1.dotProduct(vector2) / (magnitude1 * magnitude2);
    return (Math.acos(cosineTheta) * 180) / Math.PI;
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

  isPointOnElement(point: Point): boolean {
    const delta: number = this.getThickness()/2;
    const isP1OverP2: boolean = this.p1.y < this.p2.y;
    const isP1LeftP2: boolean = this.p1.x < this.p2.x;

    const deltaA: number = (isP1OverP2 && isP1LeftP2) || (!isP1OverP2 && !isP1LeftP2) ? delta : -delta;
    const A: Point = new Point(this.p1.x + deltaA, this.p1.y - delta);
    const B: Point = new Point(this.p1.x - deltaA, this.p1.y + delta);
    const C: Point = new Point(this.p2.x - deltaA, this.p2.y + delta);
    const D: Point = new Point(this.p2.x + deltaA, this.p2.y - delta);

    if(isP1LeftP2){
      return (point.isLeft(D, A) && point.isLeft(C, D) && point.isLeft(B, C) && point.isLeft(A, B));
    }

    return (point.isLeft(B, A) && point.isLeft(C, B) && point.isLeft(D, C) && point.isLeft(A, D));
  }

  /**
   * Clone the wall to create a new instance with the same points
   */
  clone(): Wall {
    return new Wall(this.p1, this.p2, this.defaultThickness, this.defaultColor, this.defaultSelectedColor, this.thickness,
      this.color, this.selectedColor, this.elements.map(el => el.clone()), this.isSelected);
  }

  applyOnClickableRecursive(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean {
    for (const element of this.elements) {
      const mustExecutionContinue: boolean = element.applyOnClickableRecursive(canvas, fn)
      if(!mustExecutionContinue) return false;
    }

    return fn(this);
  }
}
