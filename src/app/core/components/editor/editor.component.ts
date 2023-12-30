import {AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, ViewChild} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {ToolbarComponent} from "./toolbar/toolbar.component";
import {CommandInvoker} from "../../commands/command";
import {Board} from "../../models/board";
import {Wall} from "../../models/wall";
import {Point} from "../../models/point";
import {AddWallCommand, EditLastWallWithPointCommand} from "../../commands/wall-commands";
import {DrawState} from "../../models/draw-state";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, ToolbarComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements AfterViewInit {

  @ViewChild('canvas', {static: false}) set canvasRef(content: ElementRef) {
    if (content) { // initially setter gets called with undefined
      this.initCanvas(content);
    }
  }

  private context: CanvasRenderingContext2D | null | undefined;
  private canvas: HTMLCanvasElement | null | undefined;

  protected readonly cmdInvoker: CommandInvoker;
  private readonly board: Board;
  protected readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object,) {
    this.board = new Board();
    this.cmdInvoker = new CommandInvoker(this.board);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
  }

  private initCanvas(canvasRef: ElementRef) {
    this.context = (canvasRef.nativeElement as HTMLCanvasElement).getContext('2d');
    this.canvas = (canvasRef.nativeElement as HTMLCanvasElement);
    this.cmdInvoker.canvasCtx = this.context;
    this.addEscapeKeyListener();

    // Correction of the Zoom from responsive size
    this.canvas.width = this.canvas.getBoundingClientRect().width;
    this.canvas.height = this.canvas.getBoundingClientRect().height;
  }

  private getMouseXPosition(event: MouseEvent, canvas: HTMLCanvasElement): number {
    return (event.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.getBoundingClientRect().width);
  }

  private getMouseYPosition(event: MouseEvent, canvas: HTMLCanvasElement): number {
    return (event.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.getBoundingClientRect().height);
  }

  /**
   * Method call went the user press down the mouse on the canvas
   * @param event
   */
  onMouseDown(event: MouseEvent) {
    if (!this.canvas) return;

    const startX = this.getMouseXPosition(event, this.canvas);
    const startY = this.getMouseYPosition(event, this.canvas);
    const wall: Wall = new Wall(new Point(startX, startY), new Point(startX, startY), 2, 'black');

    this.cmdInvoker.execute(new AddWallCommand(wall));
  }

  /**
   * Method call went the user move the mouse over the canvas
   * @param event
   */
  onMouseMove(event: MouseEvent) {
    if (!this.canvas || this.board.drawState !== DrawState.Wall) return;

    const mouseX = this.getMouseXPosition(event, this.canvas);
    const mouseY = this.getMouseYPosition(event, this.canvas);
    const p2: Point = new Point(mouseX, mouseY);

    this.cmdInvoker.execute(new EditLastWallWithPointCommand(p2), false);
  }

  private addEscapeKeyListener() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  private removeEscapeKeyListener() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown(event: KeyboardEvent) {
    console.log(event.key);
    if (event.key === 'Escape') {
      this.board.drawState = DrawState.None;
    }
  }
}
