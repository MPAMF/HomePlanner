import * as uuid from 'uuid';

export class Comparable {
  public readonly id: string;

  constructor() {
    this.id = uuid.v4();
  }

  equals(other: Comparable): boolean {
    return this.id === other.id;
  }

}
