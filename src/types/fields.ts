import FieldBuilder from "./../fields/FieldBuilder";
import FieldAttribute from "./../fields/FieldAttribute";
import RelationshipAttribute from "./../fields/RelationshipAttribute";
import { Attributes, ModelType } from "./model";
import { Model } from "../Model";
import { Dictionary } from "./index";

export type FieldResolver = NonNullable<FieldOptions["get"]>;

export interface FieldOptions {
  type?: string | ModelType;
  default?: any;
  readonly?: boolean;
  list?: boolean;
  set?(value: any, model: Model, key: string, attributes: Attributes): any;
  get?(value: any, model: Model, key: string, attributes: Attributes): any;
}

export type FieldOption =
  | NonNullable<FieldOptions["get"]>
  | Omit<FieldOptions, "type">;

export type RelationshipOptions = Omit<
  FieldOptions,
  "type" | "set" | "get" | "readonly"
>;

export type FieldBuilderAttributes = Omit<FieldBuilder, "list">;
export type Fields = Dictionary<Attribute>;
export type Attribute = FieldAttribute | RelationshipAttribute;
export type FieldDecorator = (model: Model, key: string) => void;

export type FieldBuilders = Dictionary<FieldBuilder>;
export type ModelSchemas = Dictionary<Fields>;
export type ModelRegistries = Dictionary<RegisteredFields>;
export type RegisteredFields = Dictionary<Attribute | { (): Attribute }>;
