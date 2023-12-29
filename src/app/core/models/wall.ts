import {Drawable} from "./drawable";
import {Point} from "./point";
import {Comparable} from "./comparable";

export class WallElement extends Comparable implements Drawable {

  constructor(public p1: Point, public p2: Point) {
    super();
  }

  draw(ctx: CanvasRenderingContext2D) {
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

}

export class Wall extends Comparable implements Drawable {

  constructor(
    public p1: Point,
    public p2: Point,
    public thickness: number = 1,
    public color: string = 'white',
    public elements: WallElement[] = []
  ) {
    super();
  }

  // Add a wall element to the wall
  addElement(element: WallElement): void {
    this.elements.push(element);
  }

  // Remove a wall element from the wall
  removeElement(element: WallElement): void {
    const index = this.elements.findIndex(el => el.equals(element));
    if (index !== -1) {
      this.elements.splice(index, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    console.log(`Drawing Wall with thickness ${this.thickness}, color ${this.color}`);
    // TODO: implement
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.lineWidth = this.thickness;
    ctx.strokeStyle = this.color;
    ctx.stroke();

    this.elements.forEach(element => element.draw(ctx));
  }

  // Calculate the angle with another wall
  calculateAngleWith(otherWall: Wall): number {
    const vector1 = new Point(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
    const vector2 = new Point(otherWall.p2.x - otherWall.p1.x, otherWall.p2.y - otherWall.p1.y);
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    const cosineTheta = vector1.dotProduct(vector2) / (magnitude1 * magnitude2);
    return (Math.acos(cosineTheta) * 180) / Math.PI;
  }

  // Calculate the length of the wall
  length(): number {
    return this.p1.distanceTo(this.p2);
  }

  // Calculate the midpoint of the wall
  midpoint(): Point {
    return new Point((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2);
  }

  // Check if two walls are collinear
  isCollinearWith(other: Wall): boolean {
    const crossProduct =
      (this.p2.y - this.p1.y) * (other.p2.x - other.p1.x) - (this.p2.x - this.p1.x) * (other.p2.y - other.p1.y);
    return Math.abs(crossProduct) < Number.EPSILON;
  }

  // Check if a point is on the wall
  containsPoint(point: Point): boolean {
    return (
      point.x >= Math.min(this.p1.x, this.p2.x) &&
      point.x <= Math.max(this.p1.x, this.p2.x) &&
      point.y >= Math.min(this.p1.y, this.p2.y) &&
      point.y <= Math.max(this.p1.y, this.p2.y)
    );
  }

  // Clone the wall to create a new instance with the same points
  clone(): Wall {
    return new Wall(this.p1, this.p2, this.thickness, this.color, this.elements.map(el => el.clone()));
  }

}
