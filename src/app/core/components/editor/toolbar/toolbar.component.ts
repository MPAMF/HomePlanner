import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommandInvoker} from "../../../commands/command";

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

  changeColor(buttonNumber: number) {
    this.lastClickedButton = buttonNumber;
  }

  isActive(buttonNumber: number): boolean {
    return this.lastClickedButton === buttonNumber;
  }

  onClickWalls(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }

  onClickWindows(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }

  onClickDoors(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }

  onClickBoard(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }

  onClickZoomIn(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }

  onClickZoomOut(buttonNumber: number) {
    this.changeColor(buttonNumber);
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
