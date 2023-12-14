import {Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from "./header/header.component";
import {CommandInvoker} from "../../commands/command";
import {Board} from "../../models/board";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {

  @ViewChild('canvas', {static: false}) canvasRef!: ElementRef;
  private context: CanvasRenderingContext2D | null | undefined;

  private cmdInvoker: CommandInvoker;
  private board: Board;

  constructor() {
    this.cmdInvoker = new CommandInvoker();
    this.board = new Board();
  }

  ngInit() {
    this.cmdInvoker = new CommandInvoker();
  }

  ngAfterViewInit() {
    this.context = (this.canvasRef.nativeElement as HTMLCanvasElement).getContext('2d');
  }

}
