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

export interface FieldListCache {
  attributes?: string[];
  relationships?: string[];
}

export type Hooks = Partial<
  Omit<Adapter, "executeHook"> & {
    $creating(model: Model, data: Attributes): void | Attributes | false;
    $created(model: Model): void;
    $updating(model: Model, data: Attributes): void | Attributes | false;
    $updated(model: Model): void;
    $deleting(model: Model): void | false;
    $deleted(model: Model): void;
  }
>;
