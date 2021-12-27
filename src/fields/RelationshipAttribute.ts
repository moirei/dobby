import { ModelType, RelationshipOptions } from "./../types";

export default class RelationshipAttribute {
  /**
   * The attribute type.
   * @var {string}
   */
  public type?: string;

  /**
   * Indicates the attribute is a list
   */
  public isList: boolean = false;

  protected value: any;

  public readonly isRelationship = true;

  constructor(
    public key: string,
    public model: ModelType,
    options?: RelationshipOptions
  ) {
    this.value = options?.default;
    this.type = model.name;
    this.isList = options?.list || false;
  }

  /**
   * Make the attribute a list.
   *
   * @param {boolean} list
   * @returns {this}
   */
  public list(list: boolean = true) {
    this.isList = list;
    return this;
  }

  /**
   * Set the default attribute value.
   *
   * @param {any} value
   * @returns {this}
   */
  public default(value: any) {
    this.value = value;
    return this;
  }

  /**
   * Get the attribute's default value.
   *
   * @returns {any}
   */
  public getDefault() {
    return this.value;
  }
}
