/**
 * This class is used to store config information of the board
 */
export class BoardConfig {

  /**
   * The basic color of walls
   * @public
   */
  public wallColor: string;

  /**
   * The color of selected walls
   * @public
   */
  public selectWallColor: string;

  /**
   * The thickness of walls
   * @public
   */
  public wallThickness: number;

  constructor(
    wallColor: string = '#2c2b2b',
    selectWallColor: string = '#417c28',
    wallThickness: number = 10,
  ) {
    this.wallColor = wallColor;
    this.selectWallColor = selectWallColor;
    this.wallThickness = wallThickness;
  }
}
