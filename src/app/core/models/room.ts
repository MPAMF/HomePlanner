import {Wall} from "./wall";
import {Point} from "./point";
import {Canvas, DrawOn} from "./canvas";

import {ActionButtonProps, ActionsButtonOptions} from "./action-button-options";
import {Clickable, ClickableState} from "./interfaces/clickable";
import {Cloneable} from "./interfaces/cloneable";
import {CommandInvoker} from "../commands/command";
import {MatDialog} from "@angular/material/dialog";
import {
  ModalElementPropertiesComponent
} from "../components/editor/modal-element-properties/modal-element-properties.component";

export class Room extends Clickable implements Cloneable<Room> {

  constructor(
    public name: string,
    public background: string = '', // TODO: texture
    public isFinalized: boolean = false,
    public walls: Wall[] = [],
  ) {
    super();
  }

  addWall(wall: Wall) {
    this.walls.push(wall);
  }

  removeWall(wall: Wall): boolean {
    const index = this.walls.findIndex(w => w.equals(wall));
    if (index !== -1) {
      this.walls.splice(index, 1);
      return true;
    }
    return false;
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
    return this.walls.filter(wall => wall.p1.point.equals(point) || wall.p2.point.equals(point));
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
      const p1Distance = wall.p1.point.distanceTo(point);
      const p2Distance = wall.p2.point.distanceTo(point);

      if (p1Distance < p2Distance) {
        pt = wall.p1.point;
        distance = p1Distance;
      } else {
        pt = wall.p2.point;
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
   * Get all the points in the room
   */
  public getAllPoints(): Set<Point> {
    return new Set(this.walls.map(wall => [wall.p1.point, wall.p2.point]).flat());
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

  override getDrawColor(): string {
    throw new Error("Method not implemented.");
  }

  override onSelect(): void {
    this.walls.forEach(wall => wall.setState(ClickableState.SELECTED));
  }

  override onUnselect(): void {
    this.walls.forEach(wall => wall.setState(ClickableState.NONE));
  }

  override onHover(): void {
    this.walls.forEach(wall => wall.setState(ClickableState.SELECTED));
  }

  override onHoverOut(): void {
    if (this.state !== ClickableState.SELECTED) {
      this.walls.forEach(wall => wall.setState(ClickableState.NONE));
    }
  }

  override getActionsButtonOptions(point: Point): ActionsButtonOptions {
    const newActionButtonOptions: ActionsButtonOptions = new ActionsButtonOptions(true, point.x, point.y)

    const settingsButton: ActionButtonProps = new ActionButtonProps(
      'settings',
      (commandInvoker?: CommandInvoker, modalElementProperties?: MatDialog) => {
        if (commandInvoker && modalElementProperties) {
          const dialogRef = modalElementProperties.open(ModalElementPropertiesComponent, {
            enterAnimationDuration: '300ms',
            exitAnimationDuration: '300ms',
            width: '600px',
            data: {
              clickable: this
            }
          });

          // Subscribe to the afterClosed event
          dialogRef?.afterClosed().subscribe(result => {
            // Check the result to determine which button was clicked
            if (result === 'confirm') {
              //commandInvoker.execute(new ResetCurrentRoomCommand(this.board.currentRoom));
            }
          });
        }

        newActionButtonOptions.isActionsButtonVisible = false;
      }
    );

    newActionButtonOptions.buttonsAndActions = [settingsButton];
    return newActionButtonOptions;
  }

  override onDrag(offset: Point, recursive: boolean) {
    // if (!recursive) {
    //   return;
    // }
    // this.getAllPoints().forEach(point => point.translatePoint(offset));
    this.walls.forEach(wall => {
      wall.getP2(this.id).point = wall.getP2(this.id).point.translatePoint(offset);
      wall.elements.forEach(element => element.onDrag(offset, recursive))
    });
  }

  override applyOnClickableRecursive(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean {
    for (const wall of this.walls) {
      const mustExecutionContinue: boolean = wall.applyOnClickableRecursive(canvas, fn)
      if (!mustExecutionContinue) return false;
    }

    return fn(this);
  }

  override setVisibleState(newState: boolean) {
    throw new Error("Method not implemented.");
  }

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    // TODO: maybe first draw the non-selected walls and then the selected ones
    this.walls.forEach(wall => wall.draw(canvas, on));
  }

  clone() {
    return new Room(this.name, this.background, this.isFinalized,
      this.walls.map(wall => wall.clone()),
    );
  }

  restore(room: Room) {
    this.name = room.name;
    this.background = room.background;
    this.isFinalized = room.isFinalized;
    this.walls = room.walls.map(wall => wall.clone());
  }

  /**
   * Regroup wall by point id
   */
  sortWalls(): SorterDictionary {
    const sorterDictionary: SorterDictionary = {};
    const size: number = this.walls.length;

    let wall: Wall;
    for (let index = 0; index < size; index++){
      wall = this.walls[index];

      if (wall.getP1(this.id).id in sorterDictionary) {
        sorterDictionary[wall.getP1(this.id).id].counter++;
        sorterDictionary[wall.getP1(this.id).id].wallsIndex[0] = index;
      } else {
        sorterDictionary[wall.getP1(this.id).id] = new SorterInformation();
        sorterDictionary[wall.getP1(this.id).id].wallsIndex[0] = index;
      }
      if (wall.getP2(this.id).id in sorterDictionary) {
        sorterDictionary[wall.getP2(this.id).id].counter++;
        sorterDictionary[wall.getP2(this.id).id].wallsIndex[1] = index;
      } else {
        sorterDictionary[wall.getP2(this.id).id] = new SorterInformation();
        sorterDictionary[wall.getP2(this.id).id].wallsIndex[1] = index;
      }
    }

    return sorterDictionary;
  }

  getColor(): string | undefined {
    return undefined;
  }

  getSelectedColor(): string | undefined {
    return undefined;
  }

  setColor(color?: string): void {
    this.walls.forEach(wall => wall.setColor(color));
  }

  setSelectedColor(color?: string): void {
    this.walls.forEach(wall => wall.setSelectedColor(color));
  }

}

interface SorterDictionary {
  [key: string]: SorterInformation;
}

class SorterInformation {
  public counter: number = 1;
  public wallsIndex: number[] = [];
}
