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
    const vector1 = new Point(point2Vector1.x - point1Vector1.x, point2Vector1.y - point1Vector1.y);
    const vector2 = new Point(point2Vector2.x - point1Vector2.x, point2Vector2.y - point1Vector2.y);

    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    const cosineTheta = vector1.dotProduct(vector2) / (magnitude1 * magnitude2);

    let angleInRadians = Math.acos(cosineTheta);
    if (point2Vector1.isRight(point1Vector2, point2Vector2)) {
      angleInRadians = 2 * Math.PI - angleInRadians;
    }

    return angleInRadians;
  }
}
