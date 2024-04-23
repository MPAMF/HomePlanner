/**
 * Enum for the draw state of the board
 */
export enum DrawState {
  None,
  Move,
  Wall,
  WallCreation,
  Door,
  DoorPlacement,
  Window,
  WindowPlacement,
  Delete,
  ZoomIn,
  ZoomOut,
}

export function isWallDrawState(state: DrawState): boolean {
  return state === DrawState.Wall || state === DrawState.WallCreation;
}
