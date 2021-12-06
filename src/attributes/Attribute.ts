import { FieldOptions, FieldResolver, ModelType } from "../types";
import { resolveType } from "../utils/methods";
import { isUndefined } from "lodash";

export abstract class Attribute {
  /**
   * The attribute's name.
   * @var {string}
   */
  public name?: string;

  /**
   * The model the attribute's is related to.
   * @var {string}
   */
  public model?: ModelType;

  /**
   * Indicates the attribute is readonly
   */
  public isReadOnly: boolean = false;

  /**
   * Indicates the attribute is nullable
   */
  public isNullable: boolean = false;

  /**
   * Indicates the attribute is a list.
   */
  public isList: boolean = false;

  /**
   * Optional mutator.
   */
  public mutator: NonNullable<FieldOptions["set"]> = (value) => value;

  /**
   * Optional accessor.
   */
  public accessor: NonNullable<FieldOptions["get"]> = (value) => value;

  constructor(protected value: any, options?: FieldOptions | FieldResolver) {
    if (options) {
      if (typeof options == "function") {
        this.accessor = options;
      } else {
        if (options.type) {
          if (typeof options.type !== "string") {
            this.name = options.type.name;
            this.model = options.type;
          } else if (!isUndefined(value)) {
            this.name = resolveType(this.value, options.type);
          }
        }

        if (options.set) this.mutator = options.set;
        if (options.get) this.accessor = options.get;
      }
    }
  }

  static make(
    value: any,
    options: FieldOptions | FieldResolver = {}
  ): Attribute {
    // @ts-ignore
    return new this(value, options);
  }

  public readonly(readonly: boolean = true) {
    this.isReadOnly = readonly;
  }

  public nullable() {
    this.isNullable = true;
  }

  public list(list: boolean = true) {
    this.isList = list;
    return this;
  }

  public getDefault() {
    return this.value;
  }

  validate(value: any): boolean {
    return true;
  }
}
