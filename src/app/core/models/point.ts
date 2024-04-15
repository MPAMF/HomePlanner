import {Cloneable} from "./interfaces/cloneable";

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
}

