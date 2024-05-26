import {Point} from "./point";
import {Clickable, ClickableState} from "./interfaces/clickable";
import {Canvas, DrawOn} from "./canvas";
import {Utils} from "../modules/utils";
import {ActionButtonProps, ActionsButtonOptions} from "./action-button-options";
import {CommandInvoker} from "../commands/command";
import {DivideWallCommand} from "../commands/wall-commands";
import {HideClickableCommand} from "../commands/clickable-commands";
import {Cloneable} from "./interfaces/cloneable";
import {WallElement} from "./interfaces/wall-elements";
import {MatDialog} from "@angular/material/dialog";
import {
  ModalElementPropertiesComponent
} from "../components/editor/modal-element-properties/modal-element-properties.component";
import {ClickablePoint} from "./clickable-point";
import {RoomNeedSwitchPointDictionary} from "./interfaces/room-need-switch-point";

export class Wall extends Clickable implements Cloneable<Wall> {

  constructor(
    public p1: ClickablePoint,
    public p2: ClickablePoint,
    public roomNeedSwitchPoint: RoomNeedSwitchPointDictionary,
    private defaultThickness: number,
    private defaultColor: string,
    private defaultSelectedColor: string,
    private thickness?: number,
    private color?: string,
    private selectedColor?: string,
    public elements: WallElement[] = [],
    public isFinalized: boolean = false,
  ) {
    super();
  }

  getP1(roomId: string) {
    return this.roomNeedSwitchPoint[roomId]?.isSwitch ? this.p2 : this.p1;
  }

  getP2(roomId: string) {
    return this.roomNeedSwitchPoint[roomId]?.isSwitch ? this.p1 : this.p2;
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
   * Get the wall color or the default one, depending on the state
   * @return the color of the wall
   */
  override getDrawColor(): string {
    switch (this.state) {
      case ClickableState.NONE:
        return this.color ?? this.defaultColor;

      default:
        return this.selectedColor ?? this.defaultSelectedColor;
    }
  }

  /**
   * Add a wall element to the wall
   * @param element the new element to add
   */
  addElement(element: WallElement): void {
    this.elements.push(element);
  }

  /**
   * Remove a wall element from the wall
   * @param element the wall to remove
   */
  removeElement(element: WallElement): void {
    const index = this.elements.findIndex(el => el.equals(element));
    if (index !== -1) {
      this.elements.splice(index, 1);
    }
  }

  /**
   * Calculate the angle with another wall (range from 0 to 360)
   * @param otherWall The second wall use to calculate the angle
   */
  calculateAngleWith(otherWall: Wall): number {
    return this.calculateAngleWithTwoPoints(otherWall.p1.point, otherWall.p2.point);
  }

  /**
   * Calculate the angle with a vector created with the given points (range from 0 to 360)
   * @param point1 The first point of the vector
   * @param point2 The second point of the vector
   */
  calculateAngleWithTwoPoints(point1: Point, point2: Point): number {
    return Utils.ConvertAngleToDegrees(Utils.CalculateLeftAngle(this.p1.point, this.p2.point, point1, point2));
  }

  /**
   * Calculate the length of the wall
   */
  length(): number {
    return this.p1.point.distanceTo(this.p2.point);
  }

  /**
   * Calculate the midpoint of the wall
   */
  midpoint(): Point {
    return new Point((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2);
  }

  /**
   * Check if two walls are collinear
   * @param other the possible wall which is collinear
   */
  isCollinearWith(other: Wall): boolean {
    const crossProduct =
      (this.p2.y - this.p1.y) * (other.p2.x - other.p1.x)
      - (this.p2.x - this.p1.x) * (other.p2.y - other.p1.y);
    return Math.abs(crossProduct) < Number.EPSILON;
  }

  /**
   * Return the vector of the wall
   */
  getVector(): Point {
    return new Point(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
  }

  /**
   * Clone the wall to create a new instance with the same points
   */
  clone(): Wall {
    return new Wall(this.p1.clone(), this.p2.clone(), this.roomNeedSwitchPoint, this.defaultThickness, this.defaultColor,
      this.defaultSelectedColor, this.thickness, this.color, this.selectedColor,
      this.elements.map(el => el.clone()), this.isFinalized);
  }

  restore(wall: Wall) {
    this.p1.restore(wall.p1);
    this.p2.restore(wall.p2);
    this.defaultThickness = wall.defaultThickness;
    this.defaultColor = wall.defaultColor;
    this.defaultSelectedColor = wall.defaultSelectedColor;
    this.thickness = wall.thickness;
    this.color = wall.color;
    this.selectedColor = wall.selectedColor;
    this.elements = wall.elements;
    this.isFinalized = wall.isFinalized;
  }

  override isPointOnElement(point: Point): boolean {
    const delta: number = this.getThickness() / 2;
    const angleWithUnitaryVector: number = Utils.CalculateTrigonometricAngleWithUnitXVector(this.p1.point, this.p2.point) + Math.PI / 2;

    const A: Point = new Point(this.p1.x + Math.cos(angleWithUnitaryVector) * delta, this.p1.y + Math.sin(angleWithUnitaryVector) * delta);
    const B: Point = new Point(this.p2.x + Math.cos(angleWithUnitaryVector) * delta, this.p2.y + Math.sin(angleWithUnitaryVector) * delta);
    const C: Point = new Point(this.p2.x - Math.cos(angleWithUnitaryVector) * delta, this.p2.y - Math.sin(angleWithUnitaryVector) * delta);
    const D: Point = new Point(this.p1.x - Math.cos(angleWithUnitaryVector) * delta, this.p1.y - Math.sin(angleWithUnitaryVector) * delta);

    return (point.isLeft(D, A) && point.isLeft(C, D) && point.isLeft(B, C) && point.isLeft(A, B));
  }

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    const ctx = !this.isFinalized ? canvas.snappingLine : canvas.background;

    if (this.isVisible) {
      ctx.beginPath();
      ctx.moveTo(this.p1.x, this.p1.y);
      ctx.lineTo(this.p2.x, this.p2.y);
      ctx.lineWidth = this.getThickness();
      ctx.strokeStyle = this.getDrawColor();
      ctx.lineCap = "round";
      ctx.stroke();

      this.p1.draw(canvas, on);
      this.p2.draw(canvas, on);
    }

    this.elements.forEach(element => element.draw(canvas, on));
  }

  override onSelect(): void {
    this.p1.setState(ClickableState.SELECTED);
    this.p2.setState(ClickableState.SELECTED);
  }

  override onUnselect(): void {
    this.p1.setState(ClickableState.NONE);
    this.p2.setState(ClickableState.NONE);
  }

  override onHover(): void {
    this.p1.setState(ClickableState.HOVERED);
    this.p2.setState(ClickableState.HOVERED);
  }

  override onHoverOut(): void {
    if (this.state !== ClickableState.SELECTED) {
      this.p1.setState(ClickableState.NONE);
      this.p2.setState(ClickableState.NONE);
    }
  }

  override getActionsButtonOptions(point: Point): ActionsButtonOptions {
    const newActionButtonOptions: ActionsButtonOptions = new ActionsButtonOptions(true, point.x, point.y)
    const hideButton: ActionButtonProps = new ActionButtonProps(
      this.isVisible ? 'visibility_off' : 'visibility',
      (commandInvoker?: CommandInvoker, modalElementProperties?: MatDialog) => {
        commandInvoker ? commandInvoker.execute(new HideClickableCommand(this)) : null;
        newActionButtonOptions.isActionsButtonVisible = false;
      }
    );

    const divideButton: ActionButtonProps = new ActionButtonProps(
      'carpenter',
      (commandInvoker?: CommandInvoker, modalElementProperties?: MatDialog) => {
        commandInvoker ? commandInvoker.execute(new DivideWallCommand(this)) : null;
        newActionButtonOptions.isActionsButtonVisible = false;
      }
    );

    const settingsButton: ActionButtonProps = new ActionButtonProps(
      'settings',
      (commandInvoker?: CommandInvoker, modalElementProperties?: MatDialog) => {
        if (commandInvoker && modalElementProperties) {
          const dialogRef = modalElementProperties.open(ModalElementPropertiesComponent, {
            enterAnimationDuration: '300ms',
            exitAnimationDuration: '300ms',
            width: '600px',
            data: {
              title: 'Test',
              isWallOptions: true,
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

    newActionButtonOptions.buttonsAndActions = [hideButton, divideButton, settingsButton];
    return newActionButtonOptions;
  }

  override onDrag(offset: Point, recursive: boolean) {
    this.p1.onDrag(offset, recursive);
    this.p2.onDrag(offset, recursive);
    // if (!recursive) {
    //   return;
    // }
    this.elements.forEach(element => element.onDrag(offset, recursive));
  }

  override applyOnClickableRecursive(canvas: Canvas, fn: (clickable: Clickable) => boolean): boolean {
    // points
    if (!this.p1.applyOnClickableRecursive(canvas, fn)) return false;
    if (!this.p2.applyOnClickableRecursive(canvas, fn)) return false;
    // elements
    for (const element of this.elements) {
      const mustExecutionContinue: boolean = element.applyOnClickableRecursive(canvas, fn)
      if (!mustExecutionContinue) return false;
    }

    return fn(this);
  }

  override setVisibleState(newState: boolean) {
    this.isVisible = newState;
  }

  /**
   * Get the last wall-element added in the wall
   */
  public getLastWallElement(): WallElement | undefined {
    return this.elements.length === 0 ? undefined : this.elements[this.elements.length - 1];
  }

  /**
   * Calculate the position of the orthogonal projection onto a Wall
   * @param point The point to project
   * @return the projection of the point
   */
  projectOrthogonallyOntoWall(point: Point): Point {
    return Utils.projectOrthogonallyOntoSegment(this.p1.point, this.p2.point, point);
  }

  /**
   * Check if the point is on the wall segment
   * @param point The point to check
   */
  isPointOnSegment(point: Point) {
    return point.isPointBetweenTwoPoint(this.p1.point, this.p2.point);
  }

  override getColor(): string | undefined {
    return this.color || this.defaultColor;
  }

  override getSelectedColor(): string | undefined {
    return this.selectedColor || this.defaultSelectedColor;
  }

  /**
   * Set the color of the wall
   * @param newColor the new color
   */
  override setColor(newColor: string): void {
    this.color = newColor;
  }

  /**
   * Set the selected color of the wall
   * @param newColor the new color
   */
  override setSelectedColor(newColor: string): void {
    this.selectedColor = newColor;
  }
}
