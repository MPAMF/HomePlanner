import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatIconModule} from "@angular/material/icon";
import {Clickable} from "../../../models/interfaces/clickable";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {Wall} from "../../../models/wall";
import {WallElement} from "../../../models/wall-element";
import {Room} from "../../../models/room";

export interface ModalElementPropertiesComponentData {
  title: string;
  clickable: Clickable;
}

@Component({
  selector: 'app-modal-element-properties',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, ReactiveFormsModule, TranslateModule, FormsModule],
  templateUrl: './modal-element-properties.component.html',
  styleUrl: './modal-element-properties.component.scss'
})
export class ModalElementPropertiesComponent implements OnInit {
  public color = '#000000';
  public selectedColor = '#ff0000';
  public thickness = 1;
  public length = 1;

  constructor(
    public dialogRef: MatDialogRef<ModalElementPropertiesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalElementPropertiesComponentData
  ) {
  }

  ngOnInit(): void {
    this.color = this.data.clickable?.getColor() ?? '#000000';
    this.selectedColor = this.data.clickable?.getSelectedColor() ?? '#ff0000';

    if (this.isWall()) {
      this.thickness = (this.data.clickable as Wall).getThickness();
    }

    if (this.isWallElement()) {
      this.length = (this.data.clickable as WallElement).getLength();
    }

    if (this.isRoom()) {
      const room = this.data.clickable as Room;
      if (room.hasAnyWalls()) {
        // Get the first wall of the room
        const wall = room.walls[0];

        this.color = wall.getColor() ?? '#000000';
        this.selectedColor = wall.getSelectedColor() ?? '#ff0000';
        this.thickness = wall.getThickness();
      }
    }
  }

  onColorChange(): void {
    if (this.data.clickable && this.color !== "") {
      this.data.clickable.setColor(this.color);
    }
  }

  onSelectedColorChange(): void {
    if (this.data.clickable && this.selectedColor !== "") {
      this.data.clickable.setSelectedColor(this.selectedColor);
    }
  }

  onThicknessChange(): void {
    if (this.isWall()) {
      (this.data.clickable as Wall).setThickness(this.thickness);
    } else if (this.isRoom()) {
      const room = this.data.clickable as Room;
      room.walls.forEach(wall => wall.setThickness(this.thickness));
    }
  }

  onLengthChange(): void {
    if (this.isWallElement()) {
      (this.data.clickable as WallElement).setLength(this.length);
    }
  }

  isWall(): boolean {
    return this.data.clickable instanceof Wall;
  }

  isWallElement(): boolean {
    return this.data.clickable instanceof WallElement;
  }

  isRoom(): boolean {
    return this.data.clickable instanceof Room;
  }

}
