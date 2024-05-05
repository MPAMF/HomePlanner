import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Wall} from "../../../../../models/wall";

@Component({
  selector: 'app-wall-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wall-settings.component.html',
  styleUrl: './wall-settings.component.scss'
})
export class WallSettingsComponent {

  @Input() wall?: Wall;

  onColorChange(event: Event): void {
    const color: string = (event?.target as HTMLInputElement)?.value;
    this.wall?.setColor(color);
  }
}
