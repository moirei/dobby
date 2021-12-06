import { ParsedQueryVariables, QueryVariable } from "../types";

export class ArgumentsBucket {
  protected bucket: ParsedQueryVariables = {};

  /**
   * Add a new variable/argument to the bucket.
   * Creates a new key if name is already taken.
   *
   * @param {string} ame
   * @param {QueryVariable} variable
   * @returns
   */
  public add(name: string, variable: QueryVariable): string {
    const key = this.newKey(name);
    this.bucket[key] = {
      name: variable.type + (variable.required ? "!" : ""),
      value: variable.value,
    };

    return key;
  }

  /**
   * Whether the bucket is empty.
   *
   * @returns {boolean}
   */
  public isEmpty() {
    return !Object.keys(this.bucket).length;
  }

  /**
   * Get the bucket content.
   *
   * @returns {ParsedQueryVariables}
   */
  public getContent(): ParsedQueryVariables {
    return this.bucket;
  }

  protected newKey(name: string): string {
    if (this.bucket.hasOwnProperty(name)) {
      const existing = Object.keys(this.bucket).filter((key) =>
        key.startsWith(name)
      );
      return name + existing.length;
    }

    return name;
  }
}
