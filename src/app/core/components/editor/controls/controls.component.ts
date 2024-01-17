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
  @Input() activeCommand?: DrawState;

  isActiveCommand(stateId: DrawState): boolean {
    return this.activeCommand === stateId;
  }

  onActionCommand(stateId: DrawState) {
    this.activeCommand = stateId;
    this.commandInvoker?.execute(new EditorDrawStateCommands(stateId));
  }

  onClickZoomIn() {
    // this.commandInvoker?.execute(new ZoomCommand(1.1));
  }

  onClickZoomOut() {
    // this.commandInvoker?.execute(new DeZoomCommand(1.1));
  }

  protected readonly DrawState = DrawState;
}
