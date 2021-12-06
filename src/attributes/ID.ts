import { FieldResolver } from "../types";
import { Attribute } from "./Attribute";

export class ID extends Attribute {
  /**
   * @inheritdoc
   */
  public name: string = "ID";

  /**
   * @inheritdoc
   */
  public isReadOnly: boolean = true;

  constructor(resolver?: FieldResolver) {
    super(null, resolver);
  }

  static make(resolver?: FieldResolver): ID {
    return new ID(resolver);
  }
}
