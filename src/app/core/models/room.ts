import {Wall} from "./wall";
import {Point} from "./point";
import {Canvas, DrawOn} from "./canvas";
import {Clickable, ClickableState} from "./interfaces/clickable";
import {Cloneable} from "./interfaces/cloneable";

export class Room extends Clickable implements Cloneable<Room> {

  constructor(
    public name: string,
    public background: string = '', // TODO: texture
    public isFinalized: boolean = false,
    public walls: Wall[] = []
  ) {
    super();
  }

  addWall(wall: Wall) {
    this.walls.push(wall);
  }

  removeWall(wall: Wall) {
    const index = this.walls.findIndex(w => w.equals(wall));
    if (index !== -1) {
      this.walls.splice(index, 1);
    }
  }

  /**
   * Check whether the room has any walls
   */
  public hasAnyWalls(): boolean {
    return this.walls.length !== 0;
  }

  /**
   * Get the walls on the given point
   * @param point The point to find the walls on
   * @returns The walls on the given point
   */
  public getWallsOnPoint(point: Point): Wall[] {
    return this.walls.filter(wall => wall.p1.equals(point) || wall.p2.equals(point));
  }

  /**
   * Find the closest wall point to the given point
   * @param point Point to find the closest wall point to
   * @param maxDistance Maximum distance to search for a wall point
   * @param excludeLastWall Exclude the last wall from the search
   * @returns The closest wall point and the distance to it
   */
  public findClosestWallPoint(point: Point, maxDistance: number = -1, excludeLastWall: boolean = false): [Point, number] | undefined {
    let closestPoint: Point | undefined;
    let closestDistance = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < this.walls.length; i++) {
      if (excludeLastWall && i === this.walls.length - 1) {
        continue;
      }
      const wall = this.walls[i];
      let pt: Point;
      let distance: number;
      const p1Distance = wall.p1.distanceTo(point);
      const p2Distance = wall.p2.distanceTo(point);

      if (p1Distance < p2Distance) {
        pt = wall.p1;
        distance = p1Distance;
      } else {
        pt = wall.p2;
        distance = p2Distance;
      }

      if (maxDistance > 0 && distance > maxDistance || distance >= closestDistance) {
        continue;
      }

      closestPoint = pt;
      closestDistance = distance;
    }

    return closestPoint ? [closestPoint, closestDistance] : undefined;
  }

  /**
   * Get the last wall added in the room
   */
  public getLastWall(): Wall | undefined {
    return this.walls.length === 0 ? undefined : this.walls[this.walls.length - 1];
  }

  /**
   * Return true if the point is inside the room
   *
   * Source: https://alienryderflex.com/polygon/
   *
   * How its made: draw a horizontal line and count the number of times it crosses the polygon segments.
   * If the number of crossings is odd, the point is inside the polygon, otherwise it is outside.
   *
   * @param point The point to check
   */
  override isPointOnElement(point: Point): boolean {
    let oddNodes = false;

    for (let i = 0; i < this.walls.length; i++) {
      const {p1, p2} = this.walls[i];
      if (p1.y < point.y && p2.y >= point.y || p2.y < point.y && p1.y >= point.y) {
        if (p1.x + (point.y - p1.y) / (p2.y - p1.y) * (p2.x - p1.x) < point.x) {
          oddNodes = !oddNodes;
        }
      }
    }

    return oddNodes;
  }

  override getColor(): string {
    throw new Error("Method not implemented.");
  }

  override onSelect(): void {
    this.walls.forEach(wall => wall.setState(ClickableState.SELECTED));
  }

  override onUnselect(): void {
    this.walls.forEach(wall => wall.setState(ClickableState.NONE));
  }

  override onHover(): void {
  }

  override onHoverOut(): void {
  }

  override onDrag(offset: Point, recursive: boolean) {
    // if (!recursive) {
    //   return;
    // }
    this.walls.forEach(wall => wall.onDrag(offset, recursive));
  }

  override applyOnClickableRecursive(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean {
    for (const wall of this.walls) {
      const mustExecutionContinue: boolean = wall.applyOnClickableRecursive(canvas, fn)
      if (!mustExecutionContinue) return false;
    }

    return fn(this);
  }

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    // TODO: maybe first draw the non-selected walls and then the selected ones
    this.walls.forEach(wall => wall.draw(canvas, on));
  }

  clone() {
    return new Room(this.name, this.background, this.isFinalized, this.walls.map(wall => wall.clone()));
  }

  restore(room: Room) {
    this.name = room.name;
    this.background = room.background;
    this.isFinalized = room.isFinalized;
    this.walls = room.walls.map(wall => wall.clone());
  }

}
