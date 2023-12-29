import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from "./header/header.component";
import {CommandInvoker} from "../../commands/command";
import {Board} from "../../models/board";
import {Wall} from "../../models/wall";
import {Point} from "../../models/point";
import {AddWallCommand, EditLastWallWithPointCommand} from "../../commands/wall-commands";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements AfterViewInit {

  @ViewChild('canvas', {static: false}) canvasRef!: ElementRef;
  private context: CanvasRenderingContext2D | null | undefined;
  private canvas: HTMLCanvasElement | null | undefined;

  private cmdInvoker: CommandInvoker;
  private readonly board: Board;


  constructor() {
    this.board = new Board();
    this.cmdInvoker = new CommandInvoker(this.board);
  }

  ngAfterViewInit() {
    this.context = (this.canvasRef.nativeElement as HTMLCanvasElement).getContext('2d');
    this.canvas = (this.canvasRef.nativeElement as HTMLCanvasElement);
    this.cmdInvoker.canvasCtx = this.context;
    this.addEscapeKeyListener();
  }

  /**
   * Method call went the user press down the mouse on the canvas
   * @param event
   */
  onMouseDown(event: MouseEvent) {
    if(!this.canvas) return;

    const startX = event.clientX - this.canvas.getBoundingClientRect().left;
    const startY = event.clientY - this.canvas.getBoundingClientRect().top;
    const wall: Wall = new Wall(new Point(startX, startY), new Point(startX, startY), 2, 'black');

    this.cmdInvoker.execute(new AddWallCommand(wall));
  }

  /**
   * Method call went the user move the mouse over the canvas
   * @param event
   */
  onMouseMove(event: MouseEvent) {
    if(!this.canvas || !this.board.isDrawingWalls) return;

    const mouseX: number = event.clientX - this.canvas.getBoundingClientRect().left;
    const mouseY: number  = event.clientY - this.canvas.getBoundingClientRect().top;
    const p2: Point = new Point(mouseX, mouseY);

    this.cmdInvoker.execute(new EditLastWallWithPointCommand(p2), false);
  }

  private addEscapeKeyListener() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  private removeEscapeKeyListener() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown(event: KeyboardEvent) {
    console.log(event.key);
    if (event.key === 'Escape') {
      console.log(this.board.isDrawingWalls);
      this.board.isDrawingWalls = false;
    }
  }
}
