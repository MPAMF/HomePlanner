import {Clickable, ClickableState} from "./interfaces/clickable";
import {Cloneable} from "./interfaces/cloneable";
import {Point} from "./point";
import {Wall} from "./wall";
import {Canvas, DrawOn} from "./canvas";

export class Intersection extends Clickable implements Cloneable<Intersection> {
  private opacity: number = 0.4;

  constructor(private center: Point, private wall1: Wall, private wall2: Wall) {
    super();
  }

  private getFillColor(opacity: number = 1): string {
    return `rgba(177,36,36,${opacity})`;
  }

  private getRadius(): number {
    return Math.max(this.wall1.getThickness(), this.wall2.getThickness());
  }

  clone(): Intersection {
    return new Intersection(this.center.clone(), this.wall1.clone(), this.wall2.clone());
  }

  restore(element: Intersection): void {
    this.center = element.center;
    this.wall1 = element.wall1;
    this.wall2 = element.wall2;
  }

  applyOnClickableRecursive(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean {
    return fn(this);
  }

  getColor(): string {
    throw new Error("Method not implemented.");
  }

  isPointOnElement(point: Point): boolean {
    return point.distanceTo(this.center) <= this.getRadius();
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

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    const context = canvas.snappingLine;

    // draw the intersection circle
    context.fillStyle = this.getFillColor(this.opacity);
    context.beginPath();
    context.arc(this.center.x, this.center.y, this.getRadius(), 0, 2 * Math.PI);
    context.fill();

    if (this.state !== ClickableState.SELECTED) {
      return;
    }

    // draw a cross in the intersection
    context.beginPath();
    // horizontal line
    context.moveTo(this.center.x - 10, this.center.y);
    context.lineTo(this.center.x + 10, this.center.y);
    // vertical line
    context.moveTo(this.center.x, this.center.y - 10);
    context.lineTo(this.center.x, this.center.y + 10);
    context.stroke();
  }

}
