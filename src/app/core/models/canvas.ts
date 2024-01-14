import {Point} from "./point";

/**
 * Transform a point from the canvas to the viewport
 * @param ctx Canvas context
 * @param point Point to transform
 * @return Point transformed
 */
export function transformPoint(ctx: CanvasRenderingContext2D, point: Point): Point {
  const transformedPoint = ctx.getTransform().transformPoint(new DOMPoint(point.x, point.y));
  return new Point(transformedPoint.x, transformedPoint.y);
}

/**
 * Transform a point from the viewport to the canvas
 * @param ctx Canvas context
 * @param point Point to transform
 * @return Point transformed
 */
export function inverseTransformPoint(ctx: CanvasRenderingContext2D, point: Point): Point {
  const transformedPoint = ctx.getTransform().inverse().transformPoint(new DOMPoint(point.x, point.y));
  return new Point(transformedPoint.x, transformedPoint.y);
}

/**
 * Move the canvas
 * @param ctx Canvas context
 * @param delta Delta to move the canvas
 */
export function moveCanvas(ctx: CanvasRenderingContext2D, delta: Point) {
  const currentTransform = ctx.getTransform();

  const translationMatrix = new DOMMatrix();
  translationMatrix.translateSelf(delta.x, delta.y);

  const newTransform = currentTransform.multiplySelf(translationMatrix);

  ctx.setTransform(newTransform);
}

/**
 * Zoom the canvas
 * @param ctx Canvas context
 * @param pt Point to zoom
 * @param scaleFactor Scale factor
 */
export function zoomCanvas(ctx: CanvasRenderingContext2D, pt: Point, scaleFactor: number) {
  let matrix = DOMMatrix.fromMatrix(ctx.getTransform());
  matrix = matrix.translate(pt.x, pt.y);
  matrix = matrix.scale(scaleFactor, scaleFactor);
  matrix = matrix.translate(-pt.x, -pt.y);
 // matrix = matrix.multiply(matrix);
  ctx.setTransform(matrix);
}

/**
 * Reset the canvas
 * @param ctx Canvas context
 */
export function resetCanvas(ctx: CanvasRenderingContext2D) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Clear the canvas
 * @param ctx Canvas context
 */
export function clearCanvas(ctx: CanvasRenderingContext2D) {
  ctx.save();
  resetCanvas(ctx);
  ctx.restore();
}

/**
 * Draw without transform
 * @param ctx Canvas context
 * @param drawFn Function to draw
 */
export function drawWithoutTransform(ctx: CanvasRenderingContext2D, drawFn: (ctx: CanvasRenderingContext2D) => void) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawFn(ctx);
  ctx.restore();
}

/**
 * Draw an image on the canvas (height and width are scaled)
 * @param ctx
 * @param image
 * @param point
 * @param width
 * @param height
 */
export function drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, point: Point, width: number, height: number) {
  const scaleX = ctx.getTransform().a;
  const scaleY = ctx.getTransform().d;
  ctx.drawImage(image, point.x, point.y, width / scaleX, height / scaleY);
}
