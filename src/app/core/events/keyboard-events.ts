import {BaseEvent} from "./base-event";
import {CommandInvoker} from "../commands/command";
import {EditorDrawStateCommands} from "../commands/editor-commands";
import {DrawState} from "../models/draw-state";
import {MatDialog} from "@angular/material/dialog";
import {ResetCurrentRoom} from "../commands/canvas-commands";
import {DialogConfirmationComponent} from "../../shared/components/dialog-confirmation.component";

export class KeyboardEvents extends BaseEvent {

  constructor(cmdInvoker: CommandInvoker, actionCmdInvoker: CommandInvoker, dialog: MatDialog) {
    super(cmdInvoker, actionCmdInvoker, dialog);
  }

  onKeyDown(event: KeyboardEvent) {
    console.log(event);
    if (!this.cmdInvoker) {
      return;
    }
    const key = event.key;
    const lowerKey = key.toLowerCase();

    if (event.key === 'Escape') {

      // Cancel current dialog and stops
      if(this.dialogRef?.id)
      {
        return;
      }

      // Cancel the wall drawing which requires user's action
      if(this.board.drawState === DrawState.WallCreation && this.board.currentRoom?.hasAnyWalls())
      {
        this.openCancelWallCreationDialog();
      }
      // Cancel every other state
      else {
        this.cmdInvoker.execute(new EditorDrawStateCommands(DrawState.None));
      }

      return;
    }

    if (lowerKey === 'w') {
      this.cmdInvoker.execute(new EditorDrawStateCommands(DrawState.Wall));
      return;
    }

    // All events with Ctrl
    if (event.ctrlKey) {
      if (lowerKey === 'z') {
        this.cmdInvoker.undo();
        return;
      }

      if (lowerKey === 'y') {
        this.cmdInvoker.redo();
        return;
      }

    }

  }

  override bind() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  override unbind() {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
  }

  openCancelWallCreationDialog(): void {
    this.dialogRef = this.dialog?.open(DialogConfirmationComponent, {
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      width: '400px',
      data: {
        title: 'Warning',
        content: 'Enclose the room to continue! Make sure all walls are enclosed.'
      }
    });

    // Subscribe to the afterClosed event
    this.dialogRef?.afterClosed().subscribe(result => {
      // Check the result to determine which button was clicked
      if (result === 'confirm') {
        this.cmdInvoker.execute(new ResetCurrentRoom(this.board.currentRoom));
      }

      // At this point, the dialog is closed
      this.dialogRef = undefined;
    });
  }
}
