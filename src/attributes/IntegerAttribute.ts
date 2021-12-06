import { Model } from "../Model";
import { FieldResolver } from "../types";
import { Attribute } from "./Attribute";

export class IntegerAttribute extends Attribute {
  /**
   * @inheritdoc
   */
  public name: string = "Int";

  static make(value?: number, resolver?: FieldResolver): IntegerAttribute {
    return new IntegerAttribute(value, {
      set(value: any, model: Model, key: string) {
        return parseInt(String(value));
      },
      get(value: any, model: Model, key: string) {
        return parseInt(String(value));
      },
    });
  }

  validate(value: any): boolean {
    return typeof value === "number";
  }
}
