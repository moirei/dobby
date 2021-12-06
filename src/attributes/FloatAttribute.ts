import { FieldResolver } from "../types";
import { Attribute } from "./Attribute";

export class FloatAttribute extends Attribute {
  /**
   * @inheritdoc
   */
  public name: string = "Float";

  static make(value?: number, resolver?: FieldResolver): FloatAttribute {
    return new FloatAttribute(
      value,
      resolver || ((value) => parseFloat(String(value)))
    );
  }

  validate(value: any): boolean {
    return typeof value === "number";
  }
}
