import {Command} from "./command";
import {DrawState} from "../models/draw-state";
import {Wall} from "../models/wall";
import {Window} from "../models/wall-elements/window";
import {Point} from "../models/point";

export class AddWindowCommand extends Command {

  private previousDrawSate: DrawState = DrawState.None;

  constructor(
    private wall: Wall,
    private startPoint: Point,
    private angleInDegreesWithUnitaryVector: number,
    ) {
    super();
  }

  override execute(): void {
    this.previousDrawSate = this.board.drawState;
    this.board.drawState = DrawState.Window;

    const window: Window =  new Window(
      this.startPoint, this.wall.p1, this.wall.p2, this.angleInDegreesWithUnitaryVector,
      this.board.boardConfig.windowLength, this.board.boardConfig.windowThickness,
      this.board.boardConfig.windowColor, this.board.boardConfig.selectWindowColor
    )

    this.wall.addElement(window);
  }

  override undo(): void {

  }
}
