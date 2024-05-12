import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommandInvoker} from "../../../commands/command";
import {MatIconModule} from "@angular/material/icon";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  @Input() commandInvoker?: CommandInvoker;
  @Input() actionsCommandInvoker?: CommandInvoker;

  onClickUndo() {
    if (!this.commandInvoker || !this.commandInvoker.canUndo()) return;
    this.commandInvoker.undo();
  }

  onClickRedo() {
    if (!this.commandInvoker || !this.commandInvoker.canRedo()) return;
    this.commandInvoker.redo();
  }

}
