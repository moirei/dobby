import { Attribute } from "../attributes";
import { Adapter } from "../adapters";
import { Model } from "../Model";

export type ModelType = typeof Model;

export interface Attributes {
  [field: string]: any;
}

export interface Fields {
  [key: string]: Attribute;
}

export interface FieldCache {
  [key: string]: Fields;
}

export interface HookCache {
  [key: string]: Partial<Adapter>;
}
