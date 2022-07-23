import { Model } from "src";
import { Collection } from "src/Collection";

export * from "./adapter";
export * from "./client";
export * from "./fields";
export * from "./filter";
export * from "./model";
export * from "./query";

export type Enumerable<T> = T | T[];

export type Collectable<T extends Model> = T | Collection<T> | T[];

export interface Dictionary<T> {
  [index: string]: T;
}
