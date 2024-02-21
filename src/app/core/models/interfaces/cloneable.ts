export interface Cloneable<T> {

  /**
   * Clone the element
   * @returns The cloned element
   */
  clone(): T;

  /**
   * Restore the element
   * @param element The element to restore from
   */
  restore(element: T): void;
}
