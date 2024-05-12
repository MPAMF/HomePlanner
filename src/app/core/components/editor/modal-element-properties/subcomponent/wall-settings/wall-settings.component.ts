import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Wall} from "../../../../../models/wall";
import {Clickable} from "../../../../../models/interfaces/clickable";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-wall-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wall-settings.component.html',
  styleUrl: './wall-settings.component.scss'
})
export class WallSettingsComponent {

  @Input() clickable?: Clickable;
  selectedColor: string = this.clickable ? this.clickable.getColor() : '#ff0000';

  onColorChange(value: string): void {
    if(this.clickable && this.clickable instanceof Wall){
      this.clickable.setColor(value);
    }
  }
}
