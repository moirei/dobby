import { Query } from "../graphql";
import { Adapter } from "../adapters";

export type AdapterMethod = keyof Adapter;

type ArgumentTypes<T> = T extends (...a: infer A) => Query | void ? A : never;

export type AdapterMethodArgs<A extends AdapterMethod> = ArgumentTypes<
  Adapter[A]
>;
