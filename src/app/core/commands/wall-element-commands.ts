import {Command} from "./command";
import {DrawState} from "../models/draw-state";
import {Wall} from "../models/wall";
import {Window} from "../models/wall-elements/window";
import {Point} from "../models/point";
import {DrawOn} from "../models/canvas";
import {Door} from "../models/wall-elements/door";
import { WallElement } from "../models/interfaces/wall-elements";

export class AddWindowCommand extends Command {

  private previousDrawSate: DrawState = DrawState.None;
  private newWindow: WallElement | undefined;

  constructor(
    private wall: Wall,
    private startPoint: Point
    ) {
    super();
  }

  override execute(): void {
    this.previousDrawSate = this.board.drawState;
    this.board.drawState = DrawState.WindowPlacement;

    const pointInTheNearestWall: Point = this.wall.projectOrthogonallyOntoWall(this.startPoint);

    this.newWindow =  new Window(
      pointInTheNearestWall, this.wall.p1, this.wall.p2,
      this.board.boardConfig.windowLength, this.board.boardConfig.windowThickness,
      this.board.boardConfig.windowColor, this.board.boardConfig.selectWindowColor
    )

    this.wall.addElement(this.newWindow);
  }

  override undo(): void {
    this.board.drawState = this.previousDrawSate;

    if(this.newWindow){
      this.wall.removeElement(this.newWindow);
    }
  }
}

export class EditLastWindowCommand extends Command {

  private previousPosition: Point = new Point();

  constructor(
    private wall: Wall,
    private startPoint: Point
  ) {
    super(DrawOn.SnappingLine);
  }

  override execute(): void {
    const pointInTheNearestWall: Point = this.wall.projectOrthogonallyOntoWall(this.startPoint);

    const window: WallElement | undefined = this.wall.getLastWallElement();
    if(!window || window.isFinalized){
      return;
    }

    this.previousPosition = window.p1;
    window.update(pointInTheNearestWall);
  }

  override undo(): void {
    const window: WallElement | undefined = this.wall.getLastWallElement();
    if(!window){
      return;
    }

    window.update(this.previousPosition);
  }
}

export class FinalizeWindowCommand extends Command {

  private previousDrawSate: DrawState = DrawState.None;

  constructor(
    private wall: Wall
  ) {
    super();
  }

  override execute(): void {
    this.previousDrawSate = this.board.drawState;
    this.board.drawState = DrawState.None;

    const window: WallElement | undefined = this.wall.getLastWallElement();
    if(!window){
      return;
    }

    window.isFinalized = true;
  }

  override undo(): void {
    this.board.drawState = this.previousDrawSate;

    const window: WallElement | undefined = this.wall.getLastWallElement();
    if(!window){
      return;
    }

    window.isFinalized = false;
  }
}

export class AddDoorCommand extends Command {

  private previousDrawSate: DrawState = DrawState.None;
  private newDoor: WallElement | undefined;

  constructor(
    private wall: Wall,
    private startPoint: Point
  ) {
    super();
  }

  override execute(): void {
    this.previousDrawSate = this.board.drawState;
    this.board.drawState = DrawState.WindowPlacement;

    const pointInTheNearestWall: Point = this.wall.projectOrthogonallyOntoWall(this.startPoint);

    this.newDoor = new Door(
      pointInTheNearestWall, this.wall.p1, this.wall.p2,
      this.board.boardConfig.windowLength, this.board.boardConfig.windowThickness,
      this.board.boardConfig.windowColor, this.board.boardConfig.selectWindowColor
    )

    this.wall.addElement(this.newDoor);
  }

  override undo(): void {
    this.board.drawState = this.previousDrawSate;

    if(this.newDoor){
      this.wall.removeElement(this.newDoor);
    }
  }
}

export class EditLastDoorCommand extends Command {

  private previousPosition: Point = new Point();

  constructor(
    private wall: Wall,
    private startPoint: Point
  ) {
    super(DrawOn.SnappingLine);
  }

  override execute(): void {
    const pointInTheNearestWall: Point = this.wall.projectOrthogonallyOntoWall(this.startPoint);

    const door: WallElement | undefined = this.wall.getLastWallElement();
    if(!door || door.isFinalized){
      return;
    }

    this.previousPosition = door.p1;
    door.update(pointInTheNearestWall);
  }

  override undo(): void {
    const door: WallElement | undefined = this.wall.getLastWallElement();
    if(!door){
      return;
    }

    door.update(this.previousPosition);
  }
}

export class FinalizeDoorCommand extends Command {

  private previousDrawSate: DrawState = DrawState.None;

  constructor(
    private wall: Wall
  ) {
    super();
  }

  override execute(): void {
    this.previousDrawSate = this.board.drawState;
    this.board.drawState = DrawState.None;

    const door: WallElement | undefined = this.wall.getLastWallElement();
    if(!door){
      return;
    }

    door.isFinalized = true;
  }

  override undo(): void {
    this.board.drawState = this.previousDrawSate;

    const door: WallElement | undefined = this.wall.getLastWallElement();
    if(!door){
      return;
    }

    door.isFinalized = false;
  }
}

