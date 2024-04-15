import {Clickable, ClickableState} from "./clickable";
import {Cloneable} from "./cloneable";
import {Point} from "../point";
import {Canvas} from "../canvas";

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
