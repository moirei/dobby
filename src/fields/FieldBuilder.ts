import { get, omit } from "lodash";
import { Model } from "src";
import {
  ModelType,
  FieldOption,
  FieldOptions,
  RelationshipOptions,
  FieldBuilderAttributes,
} from "./../types";
import FieldAttribute from "./FieldAttribute";
import JsonFieldAttribute from "./JsonFieldAttribute";
import RelationshipAttribute from "./RelationshipAttribute";

function resolveFieldOptions(
  option?: any | NonNullable<FieldOptions["get"]> | FieldOptions
) {
  let o: FieldOptions;
  if (typeof option === "function") {
    o = { get: option };
  } else if (typeof option === "object") {
    o = omit(option, ["type"]);
  } else {
    o = { default: option };
  }

  return omit(o, ["type"]);
}

export default class FieldBuilder {
  constructor(protected modelClass: ModelType) {
    //
  }

  /**
   * Define an attribute field.
   *
   * @param {string} name
   * @param {FieldOptions} options
   * @returns {FieldAttribute|RelationshipAttribute}
   */
  public attr(name: string, options?: FieldOptions): FieldAttribute;
  public attr(
    name: string,
    options: RelationshipOptions & { type: ModelType }
  ): RelationshipAttribute;
  public attr(
    name: string,
    options?: FieldOptions | (RelationshipOptions & { type: ModelType })
  ): FieldAttribute | RelationshipAttribute {
    if (options && options.type && typeof options.type !== "string") {
      return this.relation(name, options.type, omit(options, "type"));
    }

    const attr = new FieldAttribute(name, options);
    this.modelClass.registerFieldAttribute(attr.key, attr);

    return attr;
  }

  /**
   * Define a boolean attribute field.
   *
   * @param {string} name
   * @param {boolean|NonNullable<FieldOptions["get"]>} value
   * @returns {FieldAttribute}
   */
  public boolean(name: string, value?: boolean | FieldOption): FieldAttribute {
    const options: FieldOptions = {
      type: "Boolean",
      ...resolveFieldOptions(value),
    };

    return this.attr(name, options);
  }

  /**
   * Define a float attribute field.
   *
   * @param {string} name
   * @param {number|FieldOption value
   * @returns {FieldAttribute}
   */
  public float(name: string, value?: number | FieldOption): FieldAttribute {
    const options: FieldOptions = {
      type: "Float",
      ...resolveFieldOptions(value),
    };

    return this.attr(name, options);
  }

  /**
   * Define an ID attribute field.
   *
   * @param {string} name
   * @param {string} type
   * @returns {FieldAttribute}
   */
  public id(name: string = "id", type: string = "ID"): FieldAttribute {
    return this.attr(name, {
      type,
      readonly: true,
    });
  }

  /**
   * Define an integer attribute field.
   *
   * @param {string} name
   * @param {number|NonNullable<FieldOptions["get"]>} value
   * @returns {FieldAttribute}
   */
  public integer(
    name: string,
    value?: number | NonNullable<FieldOptions["get"]>
  ): FieldAttribute {
    const options: FieldOptions = {
      type: "Int",
      ...resolveFieldOptions(value),
    };

    return this.attr(name, options);
  }

  /**
   * Define a json attribute field.
   *
   * @param {string} name
   * @param {string} type
   * @returns {JsonFieldAttribute}
   */
  public json(
    name: string,
    type: string | { type?: string; watch?: boolean } = "Json"
  ): JsonFieldAttribute {
    const attr = new JsonFieldAttribute(name, type);
    this.modelClass.registerFieldAttribute(attr.key, attr);

    return attr;
  }

  /**
   * Define a model relationship field.
   *
   * @param {string} name
   * @param {ModelType} model
   * @param {RelationshipOptions} options
   * @returns {RelationshipAttribute}
   */
  public model(
    name: string,
    model: ModelType,
    options?: RelationshipOptions
  ): RelationshipAttribute {
    return this.relation(name, model, options);
  }

  /**
   * Define a model relationship field.
   *
   * @param {string} name
   * @param {ModelType} model
   * @param {RelationshipOptions} options
   * @returns {RelationshipAttribute}
   */
  public relation(
    name: string,
    model: ModelType,
    options?: RelationshipOptions
  ): RelationshipAttribute {
    const attr = new RelationshipAttribute(name, model, options);
    this.modelClass.registerFieldAttribute(attr.key, attr);

    return attr;
  }

  /**
   * Define a string attribute field.
   *
   * @param {string} name
   * @param {string|FieldOption} value
   * @returns {StringAttribute}
   */
  public string(name: string, value?: string | FieldOption): FieldAttribute {
    const options: FieldOptions = {
      type: "String",
      ...resolveFieldOptions(value),
    };

    return this.attr(name, options);
  }

  get list(): FieldBuilderAttributes {
    const instance = this as any;
    return new Proxy(instance, {
      get(_, prop: keyof FieldBuilder) {
        return new Proxy(function () {}, {
          apply(_, thisArgs, args) {
            const attr: FieldAttribute = instance[prop](...args);
            attr.isList = true;
            return attr;
          },
        });
      },
    });
  }
}
