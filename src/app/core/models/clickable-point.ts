import {Clickable, ClickableState} from "./interfaces/clickable";
import {Cloneable} from "./interfaces/cloneable";
import {Canvas, DrawOn} from "./canvas";
import {ActionsButtonOptions} from "./action-button-options";
import {Point} from "./point";

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
    this.point = this.point.translatePoint(offset);
  }

  onHover(): void {
    // this.opacity = 0.8;
  }

  onHoverOut(): void {
    if (this.state !== ClickableState.SELECTED) {
      this.opacity = 0.4;
    }
  }

  onSelect(): void {
    // this.opacity = 0.8;
  }

  onUnselect(): void {
    this.opacity = 0.4;
  }

  override getActionsButtonOptions(point: Point): ActionsButtonOptions {
    return new ActionsButtonOptions(false, point.x, point.y);
  }

  override setVisibleState(newState: boolean): void {
    this.isVisible = newState;
  }

  restore(element: ClickablePoint): void {
    this.point.restore(element.point);
  }

  override draw(canvas: Canvas, on: DrawOn) {

    if (this.state == ClickableState.NONE) {
      return;
    }

    const context = canvas.snappingLine;

    // draw the intersection circle
    context.fillStyle = this.getFillColor(this.opacity);
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();
  }
}
