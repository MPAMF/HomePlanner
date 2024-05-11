import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Wall} from "../../../../../models/wall";
import {Clickable} from "../../../../../models/interfaces/clickable";

@Component({
  selector: 'app-wall-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wall-settings.component.html',
  styleUrl: './wall-settings.component.scss'
})
export class WallSettingsComponent {

  @Input() clickable?: Clickable;

  onColorChange(event: Event): void {
    if(this.clickable && this.clickable instanceof Wall){
      const color: string = (event?.target as HTMLInputElement)?.value;
      this.clickable.setColor(color);
    }
  }
}
