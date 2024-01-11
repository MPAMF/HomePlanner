import {Component, ElementRef, Inject, PLATFORM_ID, ViewChild} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {ToolbarComponent} from "./toolbar/toolbar.component";
import {CommandInvoker} from "../../commands/command";
import {Board} from "../../models/board";
import {EventHandler} from "../../events/event-handler";
import {Canvas} from "../../models/canvas";
import {Point} from "../../models/point";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, ToolbarComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {

  protected readonly cmdInvoker: CommandInvoker;
  protected readonly isBrowser: boolean;
  private context: CanvasRenderingContext2D | null | undefined;
  private canvas: HTMLCanvasElement | null | undefined;
  private readonly board: Board;
  protected eventHandler?: EventHandler;

  constructor(@Inject(PLATFORM_ID) platformId: object,) {
    this.board = new Board();
    this.cmdInvoker = new CommandInvoker(this.board);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @ViewChild('canvas', {static: false}) set canvasRef(content: ElementRef) {
    if (content) { // initially setter gets called with undefined
      this.initCanvas(content);
    }
  }

  private initCanvas(canvasRef: ElementRef) {
    this.context = (canvasRef.nativeElement as HTMLCanvasElement).getContext('2d');
    this.canvas = (canvasRef.nativeElement as HTMLCanvasElement);
    this.cmdInvoker.canvas = {context: this.context, canvas: this.canvas, offset: this.board.offset} as Canvas;

    // Correction of the Zoom from responsive size
    this.canvas.width = this.canvas.getBoundingClientRect().width;
    this.canvas.height = this.canvas.getBoundingClientRect().height;
    this.eventHandler = new EventHandler(this.cmdInvoker);
  }

}
