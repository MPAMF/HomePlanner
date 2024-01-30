import {Command} from "./command";
import {Point} from "../models/point";
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
  private selectedElement: Wall | Room | Door | Window | undefined;
  private selectedElementClone: Wall | Room | Door | Window | undefined;

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
    if (selectedElement instanceof Wall || selectedElement instanceof Room
      || selectedElement instanceof Door || selectedElement instanceof Window) {
      this.selectedElement = selectedElement;
      this.selectedElementClone = selectedElement.clone();
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
    } else {
      throw new Error("Unknown element");
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

    if (this.board.draggingApplyFn) {
      this.board.draggingApplyFn();
    }

    this.board.selectedElement.onDrag(this.offset, true);
  }

  override undo(): void {
  }
}

export class EndObjectDragCommand extends Command {
  constructor() {
    super();
  }

  override execute(): void {
    this.board.isDragging = false;
  }

  override undo(): void {
    this.board.isDragging = true;
  }
}

