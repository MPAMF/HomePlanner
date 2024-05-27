import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommandInvoker} from "../../../commands/command";
import {MatIconModule} from "@angular/material/icon";
import {TranslateModule} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {SettingsComponent} from "../../settings/settings.component";

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

  constructor(private matDialog: MatDialog) {
  }

  onClickUndo() {
    if (!this.commandInvoker || !this.commandInvoker.canUndo()) return;
    this.commandInvoker.undo();
  }

  onClickRedo() {
    if (!this.commandInvoker || !this.commandInvoker.canRedo()) return;
    this.commandInvoker.redo();
  }

  openSettingsModal() {
    this.matDialog.open(SettingsComponent, {
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      width: '400px',
      data: {
        canvas: this.commandInvoker?.canvas
      }
    });
  }

  exportToPng() {
    if (!this.commandInvoker || !this.commandInvoker.canvas) return;
    const link = document.createElement('a');
    const date = new Date();
    link.download = `HomePlanner_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.png`;
    link.href = this.commandInvoker?.canvas?.background.canvas.toDataURL()
    link.click();
  }
}
