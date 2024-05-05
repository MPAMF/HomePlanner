import {Component, Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatIconModule} from "@angular/material/icon";
import {WallSettingsComponent} from "./subcomponent/wall-settings/wall-settings.component";
import {WindowSettingsComponent} from "./subcomponent/window-settings/window-settings.component";
import {Wall} from "../../../models/wall";
import {Window} from "../../../models/wall-elements/window";

export interface ModalElementPropertiesComponentData {
  title: string;
  wallSection: {
    isWallOption: boolean;
    wall: Wall;
  }
  windowsSection: {
    isWindowsOption: boolean;
    window: Window;
  }
}

@Component({
  selector: 'app-modal-element-properties',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, WallSettingsComponent, WindowSettingsComponent],
  templateUrl: './modal-element-properties.component.html',
  styleUrl: './modal-element-properties.component.scss'
})
export class ModalElementPropertiesComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalElementPropertiesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalElementPropertiesComponentData
  ) {
  }
}
