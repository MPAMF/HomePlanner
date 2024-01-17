import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {CommandInvoker} from "../../../commands/command";
import {EditorDrawStateCommands} from "../../../commands/editor-commands";
import {DrawState} from "../../../models/draw-state";

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.scss'
})
export class ControlsComponent {
  @Input() commandInvoker?: CommandInvoker;

  isActiveCommand(drawState: DrawState): boolean {
    return this.commandInvoker?.board?.drawState === drawState;
  }

  onActionCommand(drawState: DrawState) {
    this.commandInvoker?.execute(new EditorDrawStateCommands(drawState));
  }

  onClickZoomIn() {
    // this.commandInvoker?.execute(new ZoomCommand(1.1));
  }

  onClickZoomOut() {
    // this.commandInvoker?.execute(new DeZoomCommand(1.1));
  }

  protected readonly DrawState = DrawState;
}
