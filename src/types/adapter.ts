import { Query } from "../graphql";
import { Adapter } from "../adapters";

export type AdapterMethod = keyof Adapter;

type ArgumentTypes<T> = T extends (...a: infer A) => any ? A : never;

export type MethodArgs<T, K extends keyof T> = ArgumentTypes<T[K]>;

export type AdapterMethodArgs<A extends AdapterMethod> = MethodArgs<Adapter, A>;
