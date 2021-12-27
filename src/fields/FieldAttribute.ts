import { isUndefined } from "lodash";
import { FieldOptions } from "./../types";
import { resolveType } from "./../utils/methods";

export default class FieldAttribute {
  public type?: string;
  protected value: any;
  public readonly isRelationship = false;

  /**
   * Optional mutator.
   */
  public mutator: NonNullable<FieldOptions["set"]> = (value) => value;

  /**
   * Optional accessor.
   */
  public accessor: NonNullable<FieldOptions["get"]> = (value) => value;

  constructor(public key: string, options?: FieldOptions) {
    if (typeof options == "function") {
      this.accessor = options;
    } else if (options) {
      this.value = options.default;
      this.isReadonly = options.readonly || false;
      this.isList = options.list || false;
      if (options.type) {
        if (typeof options.type !== "string") {
          this.type = options.type.name;
        } else {
          this.type = options.type;
        }
      } else if (!isUndefined(this.value)) {
        this.type = resolveType(this.value, options.type);
      }

      if (options.set) this.mutator = options.set;
      if (options.get) this.accessor = options.get;
    }
  }

  /**
   * Indicates the attribute is readonly
   */
  public isReadonly: boolean = false;

  /**
   * Indicates the attribute is a list.
   */
  public isList: boolean = false;

  /**
   * Make the attribute readonly.
   *
   * @param {boolean} list
   * @returns {this}
   */
  public readonly(readonly: boolean = true) {
    this.isReadonly = readonly;
    return this;
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
