import { ModelType, AdapterMethod, AdapterMethodArgs } from "../types";
import { Query } from "../graphql";
import { Model } from "../Model";

export abstract class Adapter {
  abstract create(data: any, query: Query, model: ModelType): Query | void;
  abstract createMany(data: any, query: Query, model: ModelType): Query | void;
  abstract upsert(
    args: any,
    data: any,
    query: Query,
    model: ModelType
  ): Query | void;
  abstract update(
    args: any,
    data: any,
    query: Query,
    model: ModelType
  ): Query | void;
  abstract findMany(query: Query, model: ModelType): Query | void;
  abstract findUnique(args: any, query: Query, model: ModelType): Query | void;
  abstract delete(args: any, query: Query, model: ModelType): Query | void;
  abstract $update(data: any, query: Query, model: Model): Query | void;
  abstract $delete(query: Query, model: Model): Query | void;

  /**
   * Execute a hook on a method.
   * The fallback function is called if the hool does not exists.
   *
   * @param {ModelType} model
   * @param {M} name
   * @param {AdapterMethodArgs<M>} args
   * @param {Function} fallback
   * @returns
   */
  protected executeHook<M extends AdapterMethod>(
    model: ModelType,
    name: M,
    args: AdapterMethodArgs<M>,
    fallback: Function
  ) {
    const hook = model.getHook(name);
    if (hook) {
      // @ts-ignore
      return hook(...args);
    } else {
      return fallback();
    }
  }
}
