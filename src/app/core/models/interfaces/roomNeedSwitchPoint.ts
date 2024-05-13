export interface RoomNeedSwitchPointDictionary {
  [key: string]: RoomNeedSwitchPoint;
}

export class RoomNeedSwitchPoint {
  constructor(public isSwitch: boolean = false) {
  }
}
