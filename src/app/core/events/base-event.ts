import {CommandInvoker} from "../commands/command";
import {Board} from "../models/board";
import {Canvas} from "../models/canvas";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogConfirmationComponent} from "../../shared/components/dialog-confirmation.component";

export abstract class BaseEvent {
  protected canvas: Canvas;
  protected board: Board;
  protected cmdInvoker: CommandInvoker;
  protected actionCmdInvoker: CommandInvoker;
  protected dialog: MatDialog | undefined;
  protected dialogRef: MatDialogRef<DialogConfirmationComponent> | undefined;

  protected constructor(cmdInvoker: CommandInvoker, actionCmdInvoker: CommandInvoker, dialog?: MatDialog) {
    this.cmdInvoker = cmdInvoker;
    this.actionCmdInvoker = actionCmdInvoker;
    this.canvas = cmdInvoker.canvas!;
    this.board = cmdInvoker.board;
    this.dialog = dialog;
  }

  /**
   * Bind all events
   */
  abstract bind(): void;

  /**
   * Unbind all events
   */
  abstract unbind(): void;

}
