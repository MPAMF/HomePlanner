import {Board} from "../models/board";
import {Canvas, DrawOn} from "../models/canvas";

export interface ICommand {
  do(): void;

  undo(): void;
}

export abstract class Command implements ICommand {
  public readonly redrawOn?: DrawOn;

  /**
   * @protected
   * @param redrawOn When to redraw the board after executing the command
   */
  protected constructor(redrawOn: DrawOn = DrawOn.All) {
    this.redrawOn = redrawOn;
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

  private _canvas?: Canvas;

  get canvas(): Canvas {
    if (!this._canvas) {
      throw new Error("Canvas not set");
    }
    return this._canvas;
  }

  set canvas(canvas: Canvas) {
    this._canvas = canvas;
  }

  do(): void {
  }

  undo(): void {
  }

}

export class CommandInvoker {
  public canvas?: Canvas;
  private history: Command[] = [];
  private historyIndex = -1;

  constructor(public board: Board) {
  }

// TODO: maybe add a limit to the history size

  // Execute a command and add it to the history, clearing the redo history
  execute(command: Command, save: boolean = true) {
    // set board instance before executing the command
    command.board = this.board;
    this.canvas && (command.canvas = this.canvas);

    // execute the command
    command.do();

    // redraw the board if needed
    if (command.redrawOn !== undefined) {
      this.redraw(command.redrawOn);
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
      if (command.redrawOn !== undefined) {
        this.redraw(command.redrawOn);
      }
      this.historyIndex--;
    }
  }

  // Redo the last command
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const command = this.history[this.historyIndex];
      command.do();
      if (command.redrawOn !== undefined) {
        this.redraw(command.redrawOn);
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

  public redraw(on: DrawOn) {
    if (!this.canvas) {
      throw new Error("Canvas context not set, cannot redraw");
    }
    this.board.draw(this.canvas, on);
  }

}
