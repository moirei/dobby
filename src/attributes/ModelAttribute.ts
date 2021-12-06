import { Model } from "../Model";
import { Attributes, ModelType } from "../types";
import { Attribute } from "./Attribute";

export class ModelAttribute extends Attribute {
  /**
   * @inheritdoc
   */
  public name: string = "Model";

  /**
   * @inheritdoc
   */
  public isReadOnly: boolean = true;

  constructor(protected value: any, model: ModelType) {
    super(value, { type: model });
  }

  /**
   * @param {Attributes|Model|null| undefined} model
   * @param {ModelType} value
   * @returns {ModelAttribute}
   */
  static make(
    value: Attributes | Model | null | undefined,
    model: any
  ): ModelAttribute {
    return new ModelAttribute(value, model);
  }

  validate(value: any): boolean {
    return !value || typeof value === "object";
  }
}
