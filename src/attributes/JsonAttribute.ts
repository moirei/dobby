import { Model } from "../Model";
import { Attribute } from "./Attribute";

export class JsonAttribute extends Attribute {
  constructor(protected value: any, type: string = "Json") {
    super(value, {
      set(value: Object | undefined, model: Model, key: string) {
        return value ? JSON.stringify(value) : null;
      },
      get(value: string | undefined, model: Model, key: string) {
        return value ? JSON.parse(String(value)) : null;
      },
    });
    this.name = type;
  }

  /**
   *
   * @param value
   * @param {string} type
   * @returns
   */
  static make(value?: number, type?: any): JsonAttribute {
    return new JsonAttribute(value, type);
  }

  validate(value: any): boolean {
    return typeof value === "number";
  }
}
