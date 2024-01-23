export class Point {

  constructor(
    public x: number = 0,
    public y: number = 0
  ) {
  }

  // Calculate the distance between two points
  distanceTo(other: Point): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Check if two points are equal
  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  // Move the point by the specified offset
  translate(dx: number, dy: number): Point {
    return new Point(this.x + dx, this.y + dy);
  }

  // Scale the point by a factor
  scale(factor: number): Point {
    return new Point(this.x * factor, this.y * factor);
  }

  // Calculate the midpoint between two points
  midpointTo(other: Point): Point {
    const midX = (this.x + other.x) / 2;
    const midY = (this.y + other.y) / 2;
    return new Point(midX, midY);
  }

  // Rotate the point around the origin (0, 0) by a specified angle (in radians)
  rotate(angle: number): Point {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const rotatedX = this.x * cosA - this.y * sinA;
    const rotatedY = this.x * sinA + this.y * cosA;
    return new Point(rotatedX, rotatedY);
  }

  // Function to calculate the dot product with another point
  dotProduct(otherPoint: Point): number {
    return this.x * otherPoint.x + this.y * otherPoint.y;
  }

  // Clone the point to create a new instance with the same coordinates
  clone(): Point {
    return new Point(this.x, this.y);
  }

  /**
   * Function to check if the point is on the left of the line
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
   */
  isRight(p1: Point, p2: Point): boolean {
    const dxc: number = this.x - p1.x;
    const dyc: number = this.y - p1.y;
    const dxl: number = p2.x - p1.x;
    const dyl: number = p2.y - p1.y;

    return (dxc * dyl - dyc * dxl) <= 0;
  }
}

