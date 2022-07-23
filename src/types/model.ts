import { RelationshipAttribute } from "../fields";
import { Adapter } from "../adapters";
import { Model } from "../Model";
import { Collection } from "src/Collection";
import { Collectable } from ".";

export type ModelType = typeof Model;

export type ModelConstructor<T, TArgs extends [Attributes] = any> = Function &
  ModelType & {
    prototype: T;
    apply: (this: any, args: TArgs) => any;
  };

export interface Attributes {
  [field: string]: any;
}

export interface Relationships {
  [field: string]: Collectable<Model>;
}

export interface HookCache<T extends ModelType> {
  [key: string]: Partial<Adapter>;
}

export type Hooks<T extends ModelType> = Partial<
  Omit<Adapter, "executeHook"> & {
    $creating(model: Model, data: Attributes): void | Attributes | false;
    $created(model: Model): void;
    $updating(model: Model, data: Attributes): void | Attributes | false;
    $updated(model: Model): void;
    $deleting(model: Model): void | false;
    $deleted(model: Model): void;
  }
>;
