import {BaseEvent} from "./base-event";
import {CommandInvoker} from "../commands/command";
import {EditorDrawStateCommands} from "../commands/editor-commands";
import {DrawState} from "../models/draw-state";
import {DialogConfirmationComponent} from "../components/editor/dialogs/dialog-confirmation.component";
import {MatDialog} from "@angular/material/dialog";

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

      if(this.dialogRef?.id) // Cancel current dialog and stops
      {
        return;
      }

      /*if (this.board.drawState === DrawState.WallCreation && this.board.currentRoom && this.board.currentRoom.hasAnyWalls()) {
        const lastWall = this.board.currentRoom.walls[this.board.currentRoom.walls.length - 1];
        this.cmdInvoker.execute(new RemoveWallCommand(lastWall));
      } else {
        this.cmdInvoker.execute(new EditorDrawStateCommands(DrawState.None));
      }*/

      this.openCancelWallCreationDialog();
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
      data: {
        title: 'Title',
        content: 'Content'
      }
    });

    // Subscribe to the afterClosed event
    this.dialogRef?.afterClosed().subscribe(result => {
      // Check the result to determine which button was clicked
      if (result === 'cancel') {
        console.log('Cancel button was clicked');
      } else if (result === 'confirm') {
        console.log('Confirm button was clicked');
      }

      // At this point, the dialog is closed
      this.dialogRef = undefined;
    });
  }
}
