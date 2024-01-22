import {Comparable} from "./comparable";
import {Drawable} from "./drawable";
import {Wall} from "./wall";
import {Point} from "./point";
import {Canvas, DrawOn} from "./canvas";

export class Room extends Comparable implements Drawable {

  constructor(
    public name: string,
    public background: string = '', // TODO: texture
    public isFinalized: boolean = false,
    public walls: Wall[] = []
  ) {
    super();
  }

  draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    this.walls.forEach(wall => wall.draw(canvas, on));
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
}
