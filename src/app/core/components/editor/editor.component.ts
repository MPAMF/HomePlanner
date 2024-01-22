import {Component, ElementRef, Inject, PLATFORM_ID, ViewChild} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {ToolbarComponent} from "./toolbar/toolbar.component";
import {CommandInvoker} from "../../commands/command";
import {Board} from "../../models/board";
import {EventHandler} from "../../events/event-handler";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, ToolbarComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {

  protected readonly cmdInvoker: CommandInvoker;
  protected readonly actionsCmdInvoker: CommandInvoker;
  protected readonly isBrowser: boolean;
  private context: CanvasRenderingContext2D | null | undefined;
  private canvas: HTMLCanvasElement | null | undefined;
  private readonly board: Board;
  protected eventHandler?: EventHandler;

  constructor(@Inject(PLATFORM_ID) platformId: object,) {
    this.board = new Board();
    this.cmdInvoker = new CommandInvoker(this.board);
    this.actionsCmdInvoker = new CommandInvoker(this.board);
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
    if (!this.context || !this.canvas) {
      throw new Error("Canvas not found");
    }
    this.cmdInvoker.ctx = this.context;
    this.actionsCmdInvoker.ctx = this.context;

    // Correction of the Zoom from responsive size
    this.canvas.width = this.canvas.getBoundingClientRect().width;
    this.canvas.height = window.innerHeight * 0.8;
    // this.canvas.height = this.canvas.width * 0.5;
    this.eventHandler = new EventHandler(this.cmdInvoker);
  }

}
