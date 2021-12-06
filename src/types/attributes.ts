import { Attributes, ModelType } from "./model";
import { Model } from "../Model";

export type FieldResolver = NonNullable<FieldOptions["get"]>;

export type FieldOptions = {
  type?: string | ModelType;
  set?: {
    (value: any, model: Model, key: string, attributes: Attributes): any;
  };
  get?: {
    (value: any, model: Model, key: string, attributes: Attributes): any;
  };
};
