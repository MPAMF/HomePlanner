import {Point} from "./point";

export interface Canvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  offset: Point;
}

