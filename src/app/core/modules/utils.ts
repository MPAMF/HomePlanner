import {Point} from "../models/point";

export class Utils {

  /**
   * Convert a radian angle to a degrees angle
   * @param angleInRadian An angle in radian
   */
  public static ConvertAngleToDegrees(angleInRadian: number): number {
    return (angleInRadian * 180) / Math.PI;
  }

  /**
   * Convert a degrees angle to a radian angle
   * @param angleInDegrees An angle in degrees
   */
  public static ConvertAngleToRadian(angleInDegrees: number): number {
    return (angleInDegrees * Math.PI) / 180;
  }

  public static CalculatePIOverFour(angleInDegrees: number): number {
    return angleInDegrees / 45;
  }

  public static CalculateAffineFunction(a :number, x: number, b: number): number{
    return a * x + b;
  }

  public static CalculateAngle(point1Vector1: Point, point2Vector1: Point, point1Vector2: Point, point2Vector2: Point): number {
    const vector1 = point1Vector1.getVector(point2Vector1);
    const vector2 = point1Vector2.getVector(point2Vector2);

    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    const cosineTheta = vector1.dotProduct(vector2) / (magnitude1 * magnitude2);

    return Math.acos(cosineTheta);
  }

  public static CalculateLeftAngle(point1Vector1: Point, point2Vector1: Point, point1Vector2: Point, point2Vector2: Point): number {
    let angleInRadians = this.CalculateAngle(point1Vector1, point2Vector1, point1Vector2, point2Vector2);
    if (point2Vector1.isRight(point1Vector2, point2Vector2)) {
      angleInRadians = 2 * Math.PI - angleInRadians;
    }

    return angleInRadians;
  }

  public static CalculateTrigonometricAngle(point1Vector1: Point, point2Vector1: Point, point1Vector2: Point, point2Vector2: Point): number {
    const cross_x: number = point1Vector1.getVector(point2Vector1).crossProduct(Point.UNIT_X_VECTOR);
    const cross_y: number = point1Vector1.getVector(point2Vector1).crossProduct(Point.UNIT_Y_VECTOR);
    let angleInRadians: number = this.CalculateAngle(point1Vector1, point2Vector1, point1Vector2, point2Vector2);

    if ((cross_x > 0 && cross_y > 0) || cross_y > 0) {
      angleInRadians = 2 * Math.PI - angleInRadians;
    }

    return angleInRadians;
  }

  public static CalculateTrigonometricAngleWithUnitXVector(point1Vector1: Point, point2Vector1: Point): number {
    return this.CalculateTrigonometricAngle(point1Vector1, point2Vector1, Point.ORIGIN, Point.UNIT_X);
  }
}
