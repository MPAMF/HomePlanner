import {AfterViewInit, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommandInvoker} from "../../../commands/command";
import {EditorDrawStateCommands, EditorRemoveLastWallCommand} from "../../../commands/editor-commands";
import {DrawState} from "../../../models/draw-state";
import {RemoveLastWallCommand} from "../../../commands/wall-commands";
import {DeZoomCommand, ZoomCommand} from "../../../commands/canvas-commands";

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent implements AfterViewInit {
  private lastClickedButton: number = 0;
  @Input() commandInvoker?: CommandInvoker;

  ngAfterViewInit() {
    if(typeof window !== 'undefined' && window.document){
      this.addEscapeKeyListener();
    }
  }

  isActive(buttonNumber: number): boolean {
    return this.lastClickedButton === buttonNumber;
  }

  onClickWalls(buttonNumber: number) {
    this.lastClickedButton = buttonNumber;
    this.commandInvoker?.execute(new EditorDrawStateCommands(DrawState.Wall));
  }

  onClickWindows(buttonNumber: number) {
    this.lastClickedButton = buttonNumber;
    this.commandInvoker?.execute(new EditorDrawStateCommands(DrawState.Window));
  }

  onClickDoors(buttonNumber: number) {
    this.lastClickedButton = buttonNumber;
    this.commandInvoker?.execute(new EditorDrawStateCommands(DrawState.Door));
  }

  onClickBoard(buttonNumber: number) {
    this.lastClickedButton = buttonNumber;
    this.commandInvoker?.execute(new EditorDrawStateCommands(DrawState.Move));
  }

  onClickZoomIn() {
    this.commandInvoker?.execute(new ZoomCommand(1.1));
  }

  onClickZoomOut() {
    this.commandInvoker?.execute(new DeZoomCommand(1.1));
  }

  onClickUndo() {
    if (!this.commandInvoker || !this.commandInvoker.canUndo()) return;
    this.commandInvoker.undo();
  }

  onClickRedo() {
    if (!this.commandInvoker || !this.commandInvoker.canRedo()) return;
    this.commandInvoker.redo();
  }

  private addEscapeKeyListener() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  private removeEscapeKeyListener() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown(event: KeyboardEvent) {
    console.log(event.key);
    if(this.commandInvoker){
      if (event.key === 'Escape') {
        this.commandInvoker.execute(new EditorRemoveLastWallCommand());
        this.commandInvoker.execute(new EditorDrawStateCommands(DrawState.None));
        this.lastClickedButton = 0;
      }
    }
  }
}
