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

  /**
   * The basic color of windows
   * @public
   */
  public windowColor: string;

  /**
   * The color of selected windows
   * @public
   */
  public selectWindowColor: string;

  /**
   * The thickness of windows
   * @public
   */
  public windowThickness: number;

  /**
   * The length of windows
   * @public
   */
  public windowLength: number;

  constructor(
    wallColor: string = '#2c2b2b',
    selectWallColor: string = '#417c28',
    wallThickness: number = 10,

    windowColor: string = '#2c2b2b',
    selectWindowColor: string = '#417c28',
    windowThickness: number = 10,
    windowLength: number = 50,
  ) {
    this.wallColor = wallColor;
    this.selectWallColor = selectWallColor;
    this.wallThickness = wallThickness;

    this.windowColor = windowColor;
    this.selectWindowColor = selectWindowColor;
    this.windowThickness = windowThickness;
    this.windowLength = windowLength;
  }
}
