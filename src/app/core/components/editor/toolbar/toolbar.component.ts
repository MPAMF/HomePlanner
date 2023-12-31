import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommandInvoker} from "../../../commands/command";
import {EditorDrawStateCommands} from "../../../commands/editor-commands";
import {DrawState} from "../../../models/draw-state";

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  private lastClickedButton: number = 0;
  @Input() commandInvoker?: CommandInvoker;

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

  onClickZoomIn(buttonNumber: number) {
    this.lastClickedButton = buttonNumber;
    this.commandInvoker?.execute(new EditorDrawStateCommands(DrawState.ZoomIn));
  }

  onClickZoomOut(buttonNumber: number) {
    this.lastClickedButton = buttonNumber;
    this.commandInvoker?.execute(new EditorDrawStateCommands(DrawState.ZoomOut));
  }

  onClickUndo() {
    if (!this.commandInvoker || !this.commandInvoker.canUndo()) return;
    this.commandInvoker.undo();
  }

  onClickRedo() {
    if (!this.commandInvoker || !this.commandInvoker.canRedo()) return;
    this.commandInvoker.redo();
  }
}
