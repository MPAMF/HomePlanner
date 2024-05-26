import {Command} from "./command";
import {Point} from "../models/point";
import {applyToCanvas, DrawOn, moveCanvas} from "../models/canvas";
import {DrawState} from "../models/draw-state";
import {Room} from "../models/room";
import {Wall} from "../models/wall";
import {Window} from "../models/wall-elements/window";
import {Door} from "../models/wall-elements/door";
import {ClickablePoint} from "../models/clickable-point";

export class MoveCommand extends Command {
  constructor(private delta: Point) {
    super();
  }

  override do(): void {
    applyToCanvas(this.canvas, (ctx) => moveCanvas(ctx, this.delta));
  }

  override undo(): void {
    applyToCanvas(this.canvas, (ctx) => moveCanvas(ctx, new Point(-this.delta.x, -this.delta.y)));
  }
}

export class ResetCurrentRoomCommand extends Command {

  constructor(private currentRoom: Room | undefined) {
    super();
  }

  override do(): void {
    this.board.currentRoom = undefined;
    this.board.drawState = DrawState.None;
  }

  override undo(): void {
    if (!this.currentRoom) {
      return;
    }
    this.board.currentRoom = this.currentRoom;
    this.board.drawState = DrawState.WallCreation;
  }
}

export class StartObjectDragCommand extends Command {
  private selectedElement: Wall | Room | Door | Window | ClickablePoint | undefined;
  private selectedElementClone: Wall | Room | Door | Window | ClickablePoint | undefined;
  private walls?: Wall[];
  private draggingApplyFn?: (offset?: Point) => void;

  constructor() {
    super();
  }

  override do(): void {
    const selectedElement = this.board.selectedElement;
    if (!selectedElement) {
      return;
    }

    this.board.isDragging = true;

    // check if selected element is a wall
    if (selectedElement instanceof Wall) {
      this.selectedElement = selectedElement;
      this.selectedElementClone = selectedElement.clone();
      this.board.markLinkedWalls(selectedElement.p1.point, false);
      this.board.markLinkedWalls(selectedElement.p2.point, false);
      selectedElement.isFinalized = false;

      const walls = this.board.getWallsLinkedToPoint(selectedElement.p1.point);
      walls.push(...this.board.getWallsLinkedToPoint(selectedElement.p2.point));

      this.draggingApplyFn = () => {
        walls.forEach(wall => {
          wall.elements.forEach(element => {
            const pointInTheNearestWall: Point = wall.projectOrthogonallyOntoWall(element.p1);
            element.parentWallP1 = wall.p1.point;
            element.parentWallP2 = wall.p2.point;
            element.update(pointInTheNearestWall);
          });
        });
      }

      this.board.draggingApplyFn = this.draggingApplyFn;

    } else if (selectedElement instanceof Room) {
      this.selectedElement = selectedElement;
      this.selectedElementClone = selectedElement.clone();
      this.selectedElement.getAllPoints().forEach(point => this.board.markLinkedWalls(point, false));

      this.draggingApplyFn = () => {
        selectedElement.walls.forEach(wall => {
          wall.elements.forEach(element => {
            const pointInTheNearestWall: Point = wall.projectOrthogonallyOntoWall(element.p1);
            element.parentWallP1 = wall.p1.point;
            element.parentWallP2 = wall.p2.point;
            element.update(pointInTheNearestWall);
          });
        });
      }

      this.board.draggingApplyFn = this.draggingApplyFn;

    } else if (selectedElement instanceof Door || selectedElement instanceof Window) {
      this.selectedElement = selectedElement;
      this.selectedElementClone = selectedElement.clone();
      selectedElement.isFinalized = false;
    } else if (selectedElement instanceof ClickablePoint) {
      this.selectedElement = selectedElement;
      this.selectedElementClone = selectedElement.clone();

      // Get linked wall elements to move them
      const walls = this.board.getWallsLinkedToPoint(selectedElement.point);

      this.draggingApplyFn = () => {
        walls.forEach(wall => {
          wall.elements.forEach(element => {
            const pointInTheNearestWall: Point = wall.projectOrthogonallyOntoWall(element.p1);
            element.parentWallP1 = wall.p1.point;
            element.parentWallP2 = wall.p2.point;
            element.update(pointInTheNearestWall);
          });
        });
      }

      this.board.markLinkedWalls(selectedElement.point, false);
      this.board.draggingApplyFn = this.draggingApplyFn;
    } else {
      throw new Error("Unknown element");
    }

  }

  override undo(): void {
    this.board.isDragging = false;

    if (!this.selectedElement || !this.selectedElementClone) {
      return;
    }

    if (this.selectedElement instanceof Wall && this.selectedElementClone instanceof Wall) {
      this.selectedElement.restore(this.selectedElementClone);
    } else if (this.selectedElement instanceof Room && this.selectedElementClone instanceof Room) {
      this.selectedElement.restore(this.selectedElementClone);
    } else if (this.selectedElement instanceof Door && this.selectedElementClone instanceof Door) {
      this.selectedElement.restore(this.selectedElementClone);
    } else if (this.selectedElement instanceof Window && this.selectedElementClone instanceof Window) {
      this.selectedElement.restore(this.selectedElementClone);
    } else if (this.selectedElement instanceof ClickablePoint && this.selectedElementClone instanceof ClickablePoint) {
      this.selectedElement.restore(this.selectedElementClone);
    } else {
      throw new Error("Unknown element");
    }

    if (this.draggingApplyFn) {
      this.draggingApplyFn();
    }

  }
}

export class DragObjectCommand extends Command {
  constructor(private offset: Point) {
    super(DrawOn.SnappingLine);
  }

  override do(): void {
    if (!this.board.selectedElement || !this.board.isDragging) {
      return;
    }

    this.board.selectedElement.onDrag(this.offset, true);

    if (this.board.draggingApplyFn) {
      this.board.draggingApplyFn();
    }

  }

  override undo(): void {
    throw new Error("Please execute this command without saving it to the history");
  }
}

export class EndObjectDragCommand extends Command {

  constructor() {
    super();
  }

  override do(): void {
    const selectedElement = this.board.selectedElement;
    if (!selectedElement || !this.board.isDragging) {
      return;
    }

    if (selectedElement instanceof Wall) {
      selectedElement.isFinalized = true;
      this.board.markLinkedWalls(selectedElement.p1.point, true);
      this.board.markLinkedWalls(selectedElement.p2.point, true);
    } else if (selectedElement instanceof Room) {
      selectedElement.getAllPoints().forEach(point => this.board.markLinkedWalls(point, true));
    } else if (selectedElement instanceof Door) {
      selectedElement.isFinalized = true;
    } else if (selectedElement instanceof Window) {
      selectedElement.isFinalized = true;
    } else if (selectedElement instanceof ClickablePoint) {
      this.board.markLinkedWalls(selectedElement.point, true);
    }

    this.board.draggingApplyFn = undefined;
    this.board.isDragging = false;
  }

  override undo(): void {
  }
}

