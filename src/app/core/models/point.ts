import {Cloneable} from "./interfaces/cloneable";
import {Clickable, ClickableState} from "./interfaces/clickable";
import {Canvas, DrawOn} from "./canvas";
import { ActionsButtonOptions } from "./action-button-options";

export class Point implements Cloneable<Point> {

  /**
   * Create a new point
   * @param x The x coordinate
   * @param y The y coordinate
   */
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {
  }

  /**
   * Calculate the distance to another point
   * @param other The other point
   * @returns The distance to the other point
   */
  distanceTo(other: Point): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check whether the point is equal to another point
   * @param other The other point
   * @returns Whether the point is equal to the other point
   */
  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Translate the point by the specified offset
   * @param dx The x offset
   * @param dy The y offset
   * @returns The translated point
   */
  translate(dx: number, dy: number): Point {
    return new Point(this.x + dx, this.y + dy);
  }

  /**
   * Translate the point by the specified offset
   * @param pt The point offset
   * @returns The translated point
   */
  translatePoint(pt: Point): Point {
    return this.translate(pt.x, pt.y);
  }

  /**
   * Scale the point by the specified factor
   * @param factor The factor to scale by
   * @returns The scaled point
   */
  scale(factor: number): Point {
    return new Point(this.x * factor, this.y * factor);
  }

  /**
   * Calculate the midpoint between this point and another point
   * @param other The other point
   * @returns The midpoint
   */
  midpointTo(other: Point): Point {
    const midX = (this.x + other.x) / 2;
    const midY = (this.y + other.y) / 2;
    return new Point(midX, midY);
  }

  /**
   * Rotate the point by the specified angle
   * @param angle The angle to rotate by
   * @returns The rotated point
   */
  rotate(angle: number): Point {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const rotatedX = this.x * cosA - this.y * sinA;
    const rotatedY = this.x * sinA + this.y * cosA;
    return new Point(rotatedX, rotatedY);
  }

  /**
   * Calculate the dot product with another point
   * @param otherPoint The other point
   */
  dotProduct(otherPoint: Point): number {
    return this.x * otherPoint.x + this.y * otherPoint.y;
  }

  /**
   * Calculate the cross product with another point
   * @param otherPoint The other point
   */
  crossProduct(otherPoint: Point): number {
    return this.x * otherPoint.x - this.y * otherPoint.y;
  }

  /**
   * Function to clone the point
   */
  clone(): Point {
    return new Point(this.x, this.y);
  }

  /**
   * Function to restore the point
   * @param element The point to restore from
   */
  restore(element: Point): void {
    this.x = element.x;
    this.y = element.y;
  }

  /**
   * Function to check if the point is on the left of the line
   * @param p1 The first point of the line
   * @param p2 The second point of the line
   * @returns Whether the point is on the left of the line
   */
  isLeft(p1: Point, p2: Point): boolean {
    const dxc: number = this.x - p1.x;
    const dyc: number = this.y - p1.y;
    const dxl: number = p2.x - p1.x;
    const dyl: number = p2.y - p1.y;

    return (dxc * dyl - dyc * dxl) >= 0;
  }

  /**
   * Function to check if the point is on the right of the line
   * @param p1 The first point of the line
   * @param p2 The second point of the line
   * @returns Whether the point is on the right of the line
   */
  isRight(p1: Point, p2: Point): boolean {
    const dxc: number = this.x - p1.x;
    const dyc: number = this.y - p1.y;
    const dxl: number = p2.x - p1.x;
    const dyl: number = p2.y - p1.y;

    return (dxc * dyl - dyc * dxl) <= 0;
  }


  /**
   * Calculate the vector with another point
   * @param other The other point
   * @returns The vector calculate with the other point
   */
  getVector(other: Point): Point {
    return new Point(other.x - this.x, other.y - this.y)
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

}

export class ClickablePoint extends Clickable implements Cloneable<ClickablePoint> {
  private opacity: number = 0.4;

  constructor(public point: Point, private readonly radius: number = 15) {
    super();
  }

  private getFillColor(opacity: number = 1): string {
    return `rgba(177,36,36,${opacity})`;
  }

  public get x(): number {
    return this.point.x;
  }

  public set x(value: number) {
    this.point.x = value;
  }

  public get y(): number {
    return this.point.y;
  }

  public set y(value: number) {
    this.point.y = value;
  }

  applyOnClickableRecursive(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean {
    return fn(this);
  }

  clone(): ClickablePoint {
    return new ClickablePoint(this.point.clone());
  }

  getColor(): string {
    throw new Error("Method not implemented.");
  }

  isPointOnElement(point: Point): boolean {
    return point.distanceTo(this.point) <= this.radius;
  }

  onDrag(offset: Point, recursive: boolean): void {
  }

  onHover(): void {
    this.opacity = 0.8;
  }

  onHoverOut(): void {
    if (this.state !== ClickableState.SELECTED) {
      this.opacity = 0.4;
    }
  }

  onSelect(): void {
    this.opacity = 0.8;
  }

  onUnselect(): void {
    this.opacity = 0.4;
  }

  override getActionsButtonOptions(point: Point): ActionsButtonOptions {
    throw new Error("Method not implemented.");
  }

  override setVisibleState(newState: boolean): void {
    this.isVisible = newState;
  }

  restore(element: ClickablePoint): void {
    this.point.restore(element.point);
  }

  override draw(canvas: Canvas, on: DrawOn) {
    const context = canvas.snappingLine;

    // draw the intersection circle
    context.fillStyle = this.getFillColor(this.opacity);
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();

    if (this.state !== ClickableState.SELECTED) {
      return;
    }

    const crossSize = 20;
    // draw a cross in the intersection
    context.beginPath();
    // horizontal line
    context.moveTo(this.x - crossSize, this.y);
    context.lineTo(this.x + crossSize, this.y);
    // vertical line
    context.moveTo(this.x, this.y - crossSize);
    context.lineTo(this.x, this.y + crossSize);
    context.lineWidth = 1;
    context.lineCap = "butt";
    context.strokeStyle = "black";
    context.stroke();
  }
}
