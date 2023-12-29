import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from "./header/header.component";
import {CommandInvoker} from "../../commands/command";
import {Board} from "../../models/board";
import {Wall} from "../../models/wall";
import {Point} from "../../models/point";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements AfterViewInit, OnInit {

  @ViewChild('canvas', {static: false}) canvasRef!: ElementRef;
  private context: CanvasRenderingContext2D | null | undefined;
  private canvas: HTMLCanvasElement | null | undefined;

  private cmdInvoker: CommandInvoker;
  private board: Board;

  private isDrawing: boolean = false;
  private walls: Wall[] = [];

  constructor() {
    this.cmdInvoker = new CommandInvoker();
    this.board = new Board();
  }

  ngOnInit(): void {
    this.cmdInvoker = new CommandInvoker();
  }

  ngAfterViewInit() {
    this.context = (this.canvasRef.nativeElement as HTMLCanvasElement).getContext('2d');
    this.canvas = (this.canvasRef.nativeElement as HTMLCanvasElement);
    this.addEscapeKeyListener();
  }

  /**
   * Method call went the user press down the mouse on the canvas
   * @param event
   */
  onMouseDown(event: MouseEvent) {
    this.isDrawing = true;
    if(this.canvas){
      const startX = event.clientX - this.canvas.getBoundingClientRect().left;
      const startY = event.clientY - this.canvas.getBoundingClientRect().top;

      this.walls.push(new Wall(new Point(startX, startY), new Point(startX, startY), 2, 'black'));
    }
    else {
      throw new Error("Canvas is null or undefined.");
    }
  }

  /**
   * Method call went the user move the mouse over the canvas
   * @param event
   */
  onMouseMove(event: MouseEvent) {
    if(this.isDrawing){
      if(this.canvas){
        const mouseX: number = event.clientX - this.canvas.getBoundingClientRect().left;
        const mouseY: number  = event.clientY - this.canvas.getBoundingClientRect().top;

        const currentWall: Wall = this.walls[this.walls.length - 1];
        currentWall.p2.x = mouseX;
        currentWall.p2.y = mouseY;

        this.drawWall();
      }
      else {
        throw new Error("Canvas is null or undefined.");
      }
    }
  }

  private drawWall() {
    if(this.context && this.canvas){
      const drawContext: CanvasRenderingContext2D = this.context;
      drawContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.walls.forEach(wall => {
        drawContext.beginPath();
        drawContext.moveTo(wall.p1.x, wall.p1.y);
        drawContext.lineTo(wall.p2.x, wall.p2.y);
        drawContext.lineWidth = wall.thickness;
        drawContext.strokeStyle = wall.color;
        drawContext.stroke();
      });

    }
    else {
      throw new Error("Canvas is null or undefined.");
    }
  }

  private addEscapeKeyListener() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  private removeEscapeKeyListener() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown(event: KeyboardEvent) {
    //console.log(event.key);
    if (event.key === 'Escape') {
      this.isDrawing = false;
    }
  }
}
