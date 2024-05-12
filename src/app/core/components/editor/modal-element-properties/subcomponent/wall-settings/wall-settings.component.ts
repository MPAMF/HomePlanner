import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Wall} from "../../../../../models/wall";
import {Clickable} from "../../../../../models/interfaces/clickable";
import {FormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-wall-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './wall-settings.component.html',
  styleUrl: './wall-settings.component.scss'
})
export class WallSettingsComponent {
  private _clickable?: Clickable;
  @Input() set clickable(clickable: Clickable) {
    this._clickable = clickable;
    this.color = clickable.getColor() || '#000000';
    this.selectedColor = clickable.getSelectedColor() || '#ff0000';
  }

  public color = '#000000';
  public selectedColor = '#ff0000';

  onColorChange(): void {
    if (this._clickable) {
      this._clickable.setColor(this.color);
    }
  }

  onSelectedColorChange(): void {
    if (this._clickable) {
      this._clickable.setSelectedColor(this.selectedColor);
    }
  }
}
