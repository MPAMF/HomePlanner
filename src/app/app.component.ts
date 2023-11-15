import {Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import RBush from 'rbush';

interface Wall {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
}

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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const walls: Wall[] = [
      {minX: 10, minY: 10, maxX: 20, maxY: 20, id: "1"},
      {minX: 15, minY: 15, maxX: 30, maxY: 30, id: "2"},
      {minX: 25, minY: 25, maxX: 30, maxY: 30, id: "3"},
      {minX: 40, minY: 40, maxX: 50, maxY: 50, id: "4"}];
    walls.forEach(wall => {
      this.context?.beginPath();
      this.context?.rect(wall.minX, wall.minY, (wall.maxX - wall.minX), (wall.maxY - wall.minY));
      this.context?.stroke();
      this.context?.closePath();
    });
    const tree = new RBush<Wall>();
    tree.insert({minX: 10, minY: 10, maxX: 20, maxY: 20, id: "1"});
    tree.insert({minX: 15, minY: 15, maxX: 30, maxY: 30, id: "2"});
    tree.insert({minX: 25, minY: 25, maxX: 30, maxY: 30, id: "3"});
    tree.insert({minX: 40, minY: 40, maxX: 50, maxY: 50, id: "4"});
    tree.search({minX: 0, minY: 0, maxX: 100, maxY: 100}).forEach(wall => {
      console.log(wall);
    });
  }

}
