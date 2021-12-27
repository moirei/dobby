export * from "./adapter";
export * from "./client";
export * from "./fields";
export * from "./filter";
export * from "./model";
export * from "./query";

export type Enumerable<T> = T | T[];

export interface Dictionary<T> {
  [index: string]: T;
}
