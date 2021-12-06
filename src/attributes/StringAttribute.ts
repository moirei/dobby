import { FieldResolver } from "../types";
import { Attribute } from "./Attribute";

export class StringAttribute extends Attribute {
  /**
   * @inheritdoc
   */
  public name: string = "String";

  static make(value?: string, resolver?: FieldResolver): StringAttribute {
    return new StringAttribute(value, resolver);
  }

  validate(value: any): boolean {
    return typeof value === "string";
  }
}
