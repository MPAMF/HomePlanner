import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Point} from "../../../models/point";
import {EditLastWallWithPointCommand} from "../../../commands/wall-commands";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private lastClickedButton: number = 0;

  changeColor(buttonNumber: number) {
    this.lastClickedButton = buttonNumber;
  }

  isActive(buttonNumber: number): boolean {
    return this.lastClickedButton === buttonNumber;
  }

  onClickWalls(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }

  onClickWindows(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }

  onClickDoors(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }

  onClickBoard(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }

  onClickZoomIn(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }

  onClickZoomOut(buttonNumber: number) {
    this.changeColor(buttonNumber);
  }
}
