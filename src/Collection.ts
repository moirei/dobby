import { Model } from "./Model";

export class Collection<T extends Model = Model> extends Array<T> {
  // @ts-ignore
  private original: T[];

  constructor(items: T[] = []) {
    super();
    if (items.length) {
      items.forEach((item) => this.push(item));
    }
    Object.defineProperty(this, "original", {
      value: items,
      configurable: false,
    });
  }

  // static get [Symbol.species]() {
  //   return Collection;
  // }

  /**
   * Make a new collection from items
   *
   * @param {T[]} items
   * @returns {Collection<T>}
   */
  public static from<T extends Model>(
    items: T[] | Collection<T>
  ): Collection<T> {
    return new Collection(items);
  }

  /**
   * Check if is dirty
   *
   * @returns {boolean}
   */
  public $isDirty(): boolean {
    let isDirty = this.length !== this.original.length;

    if (!isDirty) {
      for (let i = 0; i < this.length; i++) {
        isDirty = this.original[i] !== this[i] || this[i].$isDirty();
        if (isDirty) break;
      }
    }

    return isDirty;
  }

  /**
   * Check dirty state of items.
   *
   * @returns {boolean}
   */
  public $isDeepDirty(): boolean {
    let isDirty = this.$isDirty();

    if (!isDirty) {
      for (let i = 0; i < this.length; i++) {
        isDirty = this[i].$isDeepDirty();
        if (isDirty) break;
      }
    }

    return isDirty;
  }

  /**
   * Keep the changedAttributes made to the model.
   */
  public $keepChanges(): void {
    // clear original
    while (this.original.length) {
      this.original.pop();
    }
    this.forEach((item) => {
      this.original.push(item);
      item.$keepChanges();
    });
  }

  /**
   * Get original items
   * @returns {T[]}
   */
  public getOriginal(): T[] {
    return this.original;
  }

  /**
   * Parse native JSON.
   *
   * @param {string} key
   * @returns {any}
   */
  toJSON(): any {
    return this.map((item: T) => item.$toJson());
  }
}
