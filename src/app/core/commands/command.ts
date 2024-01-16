import {Board} from "../models/board";

export interface ICommand {
  execute(): void;

  undo(): void;
}

export abstract class Command implements ICommand {
  public readonly redraw: boolean = false;

  protected constructor(redraw: boolean = true) {
    this.redraw = redraw;
  }

  private _board?: Board;

  get board(): Board {
    if (!this._board) {
      throw new Error("Board not set");
    }
    return this._board;
  }

  set board(board: Board) {
    this._board = board;
  }

  private _canvasCtx?: CanvasRenderingContext2D;

  get canvasCtx(): CanvasRenderingContext2D {
    if (!this._canvasCtx) {
      throw new Error("Canvas not set");
    }
    return this._canvasCtx;
  }

  set canvasCtx(canvas: CanvasRenderingContext2D) {
    this._canvasCtx = canvas;
  }

  execute(): void {
  }

  undo(): void {
  }

}

export class CommandInvoker {
  public ctx?: CanvasRenderingContext2D;
  private history: Command[] = [];
  private historyIndex = -1;

  constructor(public board: Board) {
  }

// TODO: maybe add a limit to the history size

  // Execute a command and add it to the history, clearing the redo history
  execute(command: Command, save: boolean = true) {
    // set board instance before executing the command
    command.board = this.board;
    this.ctx && (command.canvasCtx = this.ctx);

    // execute the command
    command.execute();

    // redraw the board if needed
    if (command.redraw) {
      this.redraw();
    }

    // save the command in the history if needed
    if (!save) {
      return;
    }

    this.history.splice(this.historyIndex + 1);
    this.history.push(command);
    this.historyIndex++;
  }

  // Undo the last command
  undo() {
    if (this.historyIndex >= 0) {
      const command = this.history[this.historyIndex];
      command.undo();
      if (command.redraw) {
        this.redraw();
      }
      this.historyIndex--;
    }
  }

  // Redo the last command
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const command = this.history[this.historyIndex];
      command.execute();
      if (command.redraw) {
        this.redraw();
      }
    }
  }

  /**
   * Check if the undo history is not empty
   * @returns {boolean}
   */
  public canUndo(): boolean {
    return this.historyIndex >= 0;
  }

  /**
   * Check if the redo history is not empty
   * @returns {boolean}
   */
  public canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  public redraw() {
    if (!this.ctx) {
      throw new Error("Canvas context not set, cannot redraw");
    }
    this.board.draw(this.ctx);
  }

}
