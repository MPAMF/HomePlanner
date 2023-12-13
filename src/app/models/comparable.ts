import {randomUUID} from "crypto";

export class Comparable {
    private readonly id: string;

    constructor() {
        this.id = randomUUID();
    }

    equals(other: Comparable): boolean {
        return this.id === other.id;
    }
}
