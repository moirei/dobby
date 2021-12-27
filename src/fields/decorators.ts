import {
  FieldOption,
  FieldOptions,
  ModelType,
  RelationshipOptions,
  FieldDecorator,
} from "../types";
import { get, isUndefined } from "lodash";

/**
 * Define an attribute field.
 *
 * @param {FieldOptions} value
 * @returns {FieldDecorator}
 */
export function attr(options?: FieldOptions): FieldDecorator {
  return (model, key) => {
    const builder = model.$self().getSchemaBuilder();
    builder.attr(key, options);
  };
}

/**
 * Define a boolean attribute field.
 *
 * @param {boolean|FieldOption} value
 * @returns {FieldDecorator}
 */
export function boolean(value?: boolean | FieldOption): FieldDecorator {
  return (model, key) => {
    const builder = model.$self().getSchemaBuilder();
    builder.boolean(key, value);
  };
}

/**
 * Define a float attribute field.
 *
 * @param {number|FieldOption} value
 * @returns {FieldDecorator}
 */
export function float(value?: number | FieldOption): FieldDecorator {
  return (model, key) => {
    const builder = model.$self().getSchemaBuilder();
    builder.float(key, value);
  };
}

/**
 * Define an ID attribute field.
 *
 * @param {string} type
 * @returns {FieldDecorator}
 */
export function id(type: string = "ID"): FieldDecorator {
  return (model, key) => {
    const builder = model.$self().getSchemaBuilder();
    builder.id(key, type);
  };
}

/**
 * Define an integer attribute field.
 *
 * @param {number|FieldOptions} value
 * @returns {FieldDecorator}
 */
export function integer(value?: number | FieldOptions): FieldDecorator {
  return (model, key) => {
    const builder = model.$self().getSchemaBuilder();
    builder.integer(key, isUndefined(value) ? get(model, key) : value);
  };
}

/**
 * Define a json attribute field.
 *
 * @param {string | { type: string; watch: boolean }} type
 * @returns {FieldDecorator}
 */
export function json(
  type: string | { type?: string; watch?: boolean } = "Json"
): FieldDecorator {
  return (model, key) => {
    const builder = model.$self().getSchemaBuilder();
    builder.json(key, type);
  };
}

/**
 * Define a model relationship field.
 *
 * @param {ModelType} model
 * @param {RelationshipOptions} options
 * @returns {FieldDecorator}
 */
export function model(
  modelType: ModelType,
  options?: RelationshipOptions
): FieldDecorator {
  return (model, key) => {
    const builder = model.$self().getSchemaBuilder();
    builder.model(key, modelType, options);
  };
}

/**
 * Define a model relationship field.
 *
 * @param {ModelType} model
 * @param {RelationshipOptions} options
 * @returns {FieldDecorator}
 */
export function relation(
  modelType: ModelType,
  options?: RelationshipOptions
): FieldDecorator {
  return (model, key) => {
    const builder = model.$self().getSchemaBuilder();
    builder.model(key, modelType, options);
  };
}

/**
 * Define a string attribute field.
 *
 * @param {string|FieldOption} options
 * @returns {FieldDecorator}
 */
export function string(value?: string | FieldOption): FieldDecorator {
  return (model, key) => {
    const builder = model.$self().getSchemaBuilder();
    builder.string(key, value);
  };
}
