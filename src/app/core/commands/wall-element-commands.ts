import {Command} from "./command";
import {DrawState} from "../models/draw-state";
import {Wall} from "../models/wall";
import {Window} from "../models/wall-elements/window";
import {Point} from "../models/point";
import {DrawOn} from "../models/canvas";
import {Door} from "../models/wall-elements/door";
import {WallElement} from "../models/interfaces/wall-elements";


export class AddWindowCommand extends Command {

  private previousDrawSate: DrawState = DrawState.None;
  private newWindow: WallElement | undefined;

  constructor(
    private wall: Wall,
    private startPoint: Point
  ) {
    super();
  }

  override do(): void {
    this.previousDrawSate = this.board.drawState;
    this.board.drawState = DrawState.None;

    const pointInTheNearestWall: Point = this.wall.projectOrthogonallyOntoWall(this.startPoint);

    this.newWindow = new Window(
      pointInTheNearestWall, this.wall.p1.point, this.wall.p2.point,
      this.board.boardConfig.windowLength, this.board.boardConfig.windowThickness,
      this.board.boardConfig.windowColor, this.board.boardConfig.selectWindowColor,
      true
    )

    this.wall.addElement(this.newWindow);
  }

  override undo(): void {
    this.board.drawState = this.previousDrawSate;

    if (this.newWindow) {
      this.wall.removeElement(this.newWindow);
    }
  }
}

export class AddSnappingWindowCommand extends Command {
  private newWindow: WallElement | undefined;

  constructor(
    private wall: Wall,
    private startPoint: Point
  ) {
    super();
  }

  override do(): void {
    const pointInTheNearestWall: Point = this.wall.projectOrthogonallyOntoWall(this.startPoint);

    this.newWindow = new Window(
      pointInTheNearestWall, this.wall.p1.point, this.wall.p2.point,
      this.board.boardConfig.windowLength, this.board.boardConfig.windowThickness,
      this.board.boardConfig.windowColor, this.board.boardConfig.selectWindowColor,
      true
    )

    this.board.tempDrawableElements.push(this.newWindow);
  }

  override undo(): void {
    this.board.drawState = DrawState.None;
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

  override do(): void {
    this.previousDrawSate = this.board.drawState;
    this.board.drawState = DrawState.None;

    const pointInTheNearestWall: Point = this.wall.projectOrthogonallyOntoWall(this.startPoint);

    this.newDoor = new Door(
      pointInTheNearestWall, this.wall.p1.point, this.wall.p2.point,
      this.board.boardConfig.windowLength, this.board.boardConfig.windowThickness,
      this.board.boardConfig.windowColor, this.board.boardConfig.selectWindowColor,
      true
    )

    this.wall.addElement(this.newDoor);
  }

  override undo(): void {
    this.board.drawState = this.previousDrawSate;

    if (this.newDoor) {
      this.wall.removeElement(this.newDoor);
    }
  }
}

export class AddSnappingDoorCommand extends Command {
  private newDoor: WallElement | undefined;

  constructor(
    private wall: Wall,
    private startPoint: Point
  ) {
    super();
  }

  override do(): void {
    const pointInTheNearestWall: Point = this.wall.projectOrthogonallyOntoWall(this.startPoint);

    this.newDoor = new Door(
      pointInTheNearestWall, this.wall.p1.point, this.wall.p2.point,
      this.board.boardConfig.windowLength, this.board.boardConfig.windowThickness,
      this.board.boardConfig.windowColor, this.board.boardConfig.selectWindowColor,
      true
    )

    this.board.tempDrawableElements.push(this.newDoor);
  }

  override undo(): void {
    this.board.drawState = DrawState.None;
  }
}

export class TurnDoorCommand extends Command {

  constructor(
    private door: Door
  ) {
    super();
  }

  override do(): void {
    this.door.isTurnedToLeft = !this.door.isTurnedToLeft;
    this.door.update(this.door.p1);
  }

  override undo(): void {
    this.door.isTurnedToLeft = !this.door.isTurnedToLeft;
    this.door.update(this.door.p1);
  }
}
