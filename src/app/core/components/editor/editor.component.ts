import {Component, ElementRef, Inject, PLATFORM_ID, ViewChild} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {ToolbarComponent} from "./toolbar/toolbar.component";
import {CommandInvoker} from "../../commands/command";
import {Board} from "../../models/board";
import {EventHandler} from "../../events/event-handler";
import {Canvas, DrawOn} from "../../models/canvas";
import {ControlsComponent} from "./controls/controls.component";
import {MatDialog} from "@angular/material/dialog";
import {DialogConfirmationComponent} from "../../../shared/components/dialog-confirmation.component";
import {ActionsButtonComponent} from "./actions-button/actions-button.component";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, ToolbarComponent, ControlsComponent, DialogConfirmationComponent, ActionsButtonComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent {

  protected readonly cmdInvoker: CommandInvoker;
  protected readonly actionsCmdInvoker: CommandInvoker;
  protected readonly isBrowser: boolean;
  protected eventHandler?: EventHandler;
  private backgroundContext: CanvasRenderingContext2D | null | undefined;
  private backgroundCanvas: HTMLCanvasElement | null | undefined;
  private snappingLineContext: CanvasRenderingContext2D | null | undefined;
  private snappingLineCanvas: HTMLCanvasElement | null | undefined;
  private readonly board: Board;

  constructor(@Inject(PLATFORM_ID) platformId: object, public dialog: MatDialog) {
    this.board = new Board();
    this.cmdInvoker = new CommandInvoker(this.board);
    this.actionsCmdInvoker = new CommandInvoker(this.board);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @ViewChild('background', {static: false}) set canvasRef(content: ElementRef) {
    if (content) { // initially setter gets called with undefined
      this.initCanvas(content, DrawOn.Background);
    }
  }

  @ViewChild('spectrum', {static: false}) set spectrumRef(content: ElementRef) {
    if (content) { // initially setter gets called with undefined
      this.initCanvas(content, DrawOn.SnappingLine);
    }
  }

  private initCanvas(canvasRef: ElementRef, drawOn: DrawOn) {
    const canvas = (canvasRef.nativeElement as HTMLCanvasElement);
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    switch (drawOn) {
      case DrawOn.SnappingLine:
        this.snappingLineCanvas = canvas;
        this.snappingLineContext = ctx;
        break;
      case DrawOn.Background:
        this.backgroundCanvas = canvas;
        this.backgroundContext = ctx;
        break;
      default:
        return;
    }

    // TODO: improve this
    if (!this.backgroundContext || !this.backgroundCanvas || !this.snappingLineContext || !this.snappingLineCanvas) {
      return;
    }

    this.cmdInvoker.canvas = {background: this.backgroundContext, snappingLine: this.snappingLineContext} as Canvas;
    this.actionsCmdInvoker.canvas = {
      background: this.backgroundContext,
      snappingLine: this.snappingLineContext
    } as Canvas;

    // Correction of the Zoom from responsive size
    this.backgroundCanvas.width = this.backgroundCanvas.getBoundingClientRect().width;
    this.backgroundCanvas.height = this.backgroundCanvas.getBoundingClientRect().height;
    this.snappingLineCanvas.width = this.snappingLineCanvas.getBoundingClientRect().width;
    this.snappingLineCanvas.height = this.snappingLineCanvas.getBoundingClientRect().height;
    this.eventHandler = new EventHandler(this.cmdInvoker, this.actionsCmdInvoker, this.dialog);
  }
}
