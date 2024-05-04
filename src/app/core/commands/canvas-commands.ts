import {Command} from "./command";
import {ClickablePoint, Point} from "../models/point";
import {applyToCanvas, DrawOn, moveCanvas} from "../models/canvas";
import {DrawState} from "../models/draw-state";
import {Room} from "../models/room";
import {Wall} from "../models/wall";
import {Window} from "../models/wall-elements/window";
import {Door} from "../models/wall-elements/door";

export class MoveCommand extends Command {
  constructor(private delta: Point) {
    super();
  }

  override execute(): void {
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

  override execute(): void {
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
  private draggingApplyFn?: () => void;

  constructor() {
    super();
  }

  override execute(): void {
    const selectedElement = this.board.selectedElement;
    if (!selectedElement) {
      return;
    }

    this.board.isDragging = true;

    // check if selected element is a wall
    if (selectedElement instanceof Wall) {
      this.selectedElement = selectedElement;
      this.selectedElementClone = selectedElement.clone();
      const room = this.board.getRoomByWall(selectedElement);
      if (room) {
        const p1: { wall: Wall, p1: boolean }[] = [];
        const p2: { wall: Wall, p1: boolean }[] = [];
        room.walls.forEach(wall => {
          if (wall.p1.equals(selectedElement.p1)) {
            p1.push({wall, p1: true});
          }
          if (wall.p2.equals(selectedElement.p1)) {
            p1.push({wall, p1: false});
          }
          if (wall.p1.equals(selectedElement.p2)) {
            p2.push({wall, p1: true});
          }
          if (wall.p2.equals(selectedElement.p2)) {
            p2.push({wall, p1: false});
          }
        });
        this.walls = [...p1, ...p2].map(e => e.wall);
        this.walls.forEach(w => w.isFinalized = false);
        this.draggingApplyFn = () => {
          p1.forEach(e => e.p1 ? e.wall.p1.restore(selectedElement.p1) : e.wall.p2.restore(selectedElement.p1));
          p2.forEach(e => e.p1 ? e.wall.p1.restore(selectedElement.p2) : e.wall.p2.restore(selectedElement.p2));
        }
        this.board.draggingApplyFn = this.draggingApplyFn;
      }
      selectedElement.isFinalized = false;
    } else if (selectedElement instanceof Room) {
      this.selectedElement = selectedElement;
      this.selectedElementClone = selectedElement.clone();
      selectedElement.walls.forEach(wall => wall.isFinalized = false);
    } else if (selectedElement instanceof Door || selectedElement instanceof Window) {
      this.selectedElement = selectedElement;
      this.selectedElementClone = selectedElement.clone();
    } else if (selectedElement instanceof ClickablePoint) {
      this.selectedElement = selectedElement;
      this.selectedElementClone = selectedElement.clone();
      this.draggingApplyFn = () => {
        selectedElement.restore(selectedElement);
      }
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

  override execute(): void {
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

  override execute(): void {
    const selectedElement = this.board.selectedElement;
    if (!selectedElement || !this.board.isDragging) {
      return;
    }

    if (selectedElement instanceof Wall) {
      selectedElement.isFinalized = true;
      const room = this.board.getRoomByWall(selectedElement);
      if (room) {
        room.walls.forEach(wall => wall.isFinalized = true);
      }
    } else if (selectedElement instanceof Room) {
      selectedElement.walls.forEach(wall => wall.isFinalized = true);
    } else if (selectedElement instanceof Door) {
      throw new Error("Not implemented");
    } else if (selectedElement instanceof Window) {
      throw new Error("Not implemented");
    } else if (selectedElement instanceof ClickablePoint) {
    }

    this.board.draggingApplyFn = undefined;
    this.board.isDragging = false;
  }

  override undo(): void {
  }
}

