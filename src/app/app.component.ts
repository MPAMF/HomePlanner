import {Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'HomePlanner';

  @ViewChild('canvas', {static: false}) canvasRef!: ElementRef;
  private context: CanvasRenderingContext2D | null | undefined;

  ngAfterViewInit() {
    this.context = (this.canvasRef.nativeElement as HTMLCanvasElement).getContext('2d');
    const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
   // canvas.width = window.innerWidth;
   // canvas.height = window.innerHeight;
  }

}
