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
}
