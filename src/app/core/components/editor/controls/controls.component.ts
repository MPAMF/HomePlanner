import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommandInvoker} from "../../../commands/command";
import {EditorDrawStateCommands} from "../../../commands/editor-commands";
import {DrawState} from "../../../models/draw-state";
import {MatIconModule} from "@angular/material/icon";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.scss'
})
export class ControlsComponent {
  @Input() commandInvoker?: CommandInvoker;
  @Input() actionsCommandInvoker?: CommandInvoker;
  protected readonly DrawState = DrawState;

  isActiveCommand(drawState: DrawState): boolean {
    return this.actionsCommandInvoker?.board?.drawState === drawState;
  }

  onActionCommand(drawState: DrawState) {
    this.actionsCommandInvoker?.execute(new EditorDrawStateCommands(
      this.isActiveCommand(drawState) ? DrawState.None : drawState)
    );
  }

  onClickZoomIn() {
    // this.actionsCommandInvoker?.execute(new ZoomCommand(1.1));
  }

  onClickZoomOut() {
    // this.actionsCommandInvoker?.execute(new DeZoomCommand(1.1));
  }
}
