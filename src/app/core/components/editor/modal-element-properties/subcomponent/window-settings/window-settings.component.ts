import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Clickable} from "../../../../../models/interfaces/clickable";

@Component({
  selector: 'app-window-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './window-settings.component.html',
  styleUrl: './window-settings.component.scss'
})
export class WindowSettingsComponent {

  @Input() clickable?: Clickable;
}
