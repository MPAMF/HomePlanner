import {Canvas, DrawOn} from "../canvas";
import {Point} from "../point";
import {Utils} from "../../modules/utils";
import {ActionButtonProps, ActionsButtonOptions} from "../action-button-options";
import {CommandInvoker} from "../../commands/command";
import {MatDialog} from "@angular/material/dialog";
import {TurnDoorCommand} from "../../commands/wall-element-commands";
import {WallElement} from "../wall-element";


export class Door extends WallElement {

  private p3: Point | undefined;

  constructor(
    p1: Point,
    parentWallP1: Point,
    parentWallP2: Point,
    defaultLength: number,
    defaultThickness: number,
    defaultColor: string,
    defaultSelectedColor: string,
    isFinalized: boolean = false,
    thickness?: number,
    color?: string,
    selectedColor?: string,
    length?: number,
    isRotated: boolean = false,
    isTurnedToLeft: boolean = false,
  ) {
    super(p1, p1, parentWallP1, parentWallP2, defaultLength, defaultThickness, defaultColor,
      defaultSelectedColor, thickness, color, selectedColor, length, isFinalized, isRotated, isTurnedToLeft);

    this.calculatePointPositions(p1);
  }

  override draw(canvas: Canvas, on: DrawOn = DrawOn.All): void {
    if (!this.p3) {
      return;
    }
    const ctx = !this.isFinalized ? canvas.snappingLine : canvas.background;
    let angleUnitaryVector: number = Utils.CalculateTrigonometricAngleWithUnitXVector(this.p1, this.p2);
    angleUnitaryVector += this.isRotated != this.isTurnedToLeft ? (-Math.PI/2) : 0;

    ctx.beginPath();
    ctx.moveTo(this.p3.x, this.p3.y);
    ctx.lineTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    this.isRotated != this.isTurnedToLeft ? ctx.moveTo(this.p3.x, this.p3.y) : ctx.moveTo(this.p2.x, this.p2.y);

    ctx.arc(this.p1.x, this.p1.y, this.getLength(), angleUnitaryVector, angleUnitaryVector + Math.PI /2, false);
    ctx.lineWidth = this.getThickness();
    ctx.strokeStyle = this.getDrawColor();
    ctx.lineCap = "round";
    ctx.stroke();
  }

  /**
   * Create a rectangle around the window and check if the given point is into the rectangle
   * @param point The point to check
   * @return
   */
  isPointOnElement(point: Point): boolean {
    if (!this.p3) {
      return false;
    }

    let delta: number = this.getThickness();
    const rotationMultiplier: number = this.isRotated != this.isTurnedToLeft ? -1 : 1;
    let angleUnitaryVector: number = Utils.CalculateTrigonometricAngleWithUnitXVector(this.p1, this.p2);
    const p4x: number = this.p2.x + rotationMultiplier * Math.cos(Math.PI/2 + angleUnitaryVector) * this.getLength();
    const p4y: number = this.p2.y + rotationMultiplier * Math.sin(Math.PI/2 + angleUnitaryVector) * this.getLength();
    const p4: Point = new Point(p4x, p4y);

    const midPointP1: Point = this.p1.midpointTo(this.p3);
    const midPointP2: Point = this.p2.midpointTo(p4);

    const alpha: Point = new Point(midPointP1.x - Math.cos(angleUnitaryVector) * delta, midPointP1.y - Math.sin(angleUnitaryVector) * delta);
    const beta: Point = new Point(midPointP2.x + Math.cos(angleUnitaryVector) * delta, midPointP2.y + Math.sin(angleUnitaryVector) * delta);

    delta += this.getLength() / 2;
    angleUnitaryVector += Math.PI / 2;
    const A: Point = new Point(alpha.x + Math.cos(angleUnitaryVector) * delta, alpha.y + Math.sin(angleUnitaryVector) * delta);
    const B: Point = new Point(beta.x + Math.cos(angleUnitaryVector) * delta, beta.y + Math.sin(angleUnitaryVector) * delta);
    const C: Point = new Point(beta.x - Math.cos(angleUnitaryVector) * delta, beta.y - Math.sin(angleUnitaryVector) * delta);
    const D: Point = new Point(alpha.x - Math.cos(angleUnitaryVector) * delta, alpha.y - Math.sin(angleUnitaryVector) * delta);

    return (point.isLeft(D, A) && point.isLeft(C, D) && point.isLeft(B, C) && point.isLeft(A, B));
  }

  override onDrag(offset: Point, recursive: boolean): void {
    this.update(this.p1.translatePoint(offset), true);
  }

  override onHover(): void {
  }

  override onHoverOut(): void {
  }

  override onSelect(): void {
  }

  override onUnselect(): void {
  }

  clone(): Door {
    return new Door(this.p1.clone(), this.parentWallP1, this.parentWallP2, this.defaultLength,
      this.defaultThickness, this.defaultColor, this.defaultSelectedColor, this.isFinalized,
      this.thickness, this.color, this.selectedColor, this.length, this.isRotated, this.isTurnedToLeft);
  }

  restore(element: Door): void {
    this.parentWallP1 = element.parentWallP1;
    this.parentWallP2 = element.parentWallP2;
    this.update(element.p1, true);
  }

  update(newOriginPoint: Point, needProjectOrthogonally: boolean = false): void {
    if (needProjectOrthogonally){
      newOriginPoint = Utils.projectOrthogonallyOntoSegment(this.parentWallP1, this.parentWallP2, newOriginPoint);
    }
    if(!newOriginPoint.isPointBetweenTwoPoint(this.parentWallP1, this.parentWallP2)){
      return;
    }

    this.calculatePointPositions(newOriginPoint);
  }

  calculatePointPositions(startPoint: Point): void {
    // Calculate measure
    const ACDAngle: number = Math.PI / 2;

    // Calculate position
    const parentWallLength: number = this.parentWallP1.distanceTo(this.parentWallP2);
    const unitDistance: number = this.getLength() / parentWallLength;

    let rotationMultiplier: number = this.isTurnedToLeft ? -1 : 1;
    const Cx: number = startPoint.x  + rotationMultiplier * unitDistance * (this.parentWallP2.x - this.parentWallP1.x);
    const Cy: number = startPoint.y + rotationMultiplier * unitDistance * (this.parentWallP2.y - this.parentWallP1.y);
    const calculatedP2: Point = new Point(Cx, Cy);

    // Check if the point is on the wall
    if(!calculatedP2.isPointBetweenTwoPoint(this.parentWallP1, this.parentWallP2)){
      return;
    }

    this.p1 = startPoint;
    this.p2 = calculatedP2;

    rotationMultiplier *= this.isRotated ? -1 : 1;
    const angleInDegreesWithUnitaryVector: number = Utils.CalculateTrigonometricAngleWithUnitXVector(startPoint, calculatedP2);
    const Ax: number = startPoint.x + rotationMultiplier * Math.cos(ACDAngle + angleInDegreesWithUnitaryVector) * this.getLength();
    const Ay: number = startPoint.y + rotationMultiplier * Math.sin(ACDAngle + angleInDegreesWithUnitaryVector) * this.getLength();
    this.p3 = new Point(Ax, Ay);
  }

  override setVisibleState(newState: boolean): void {
  }

  override getActionsButtonOptions(point: Point): ActionsButtonOptions {
    const newActionButtonOptions: ActionsButtonOptions = super.getActionsButtonOptions(point);

    const turnButton: ActionButtonProps = new ActionButtonProps(
      this.isTurnedToLeft ? 'rotate_right' : 'rotate_left',
      (commandInvoker?: CommandInvoker, modalElementProperties?: MatDialog) => {
        commandInvoker ? commandInvoker.execute(new TurnDoorCommand(this)) : null;
        newActionButtonOptions.isActionsButtonVisible = false;
      }
    );

    newActionButtonOptions.buttonsAndActions.push(turnButton);
    return newActionButtonOptions;
  }

}
