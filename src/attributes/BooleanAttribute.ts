import { FieldResolver } from "../types";
import { Attribute } from "./Attribute";

export class BooleanAttribute extends Attribute {
  /**
   * @inheritdoc
   */
  public name: string = "Boolean";

  static make(value?: boolean, resolver?: FieldResolver): BooleanAttribute {
    return new BooleanAttribute(value, resolver);
  }

  validate(value: any): boolean {
    return typeof value === "boolean";
  }
}
