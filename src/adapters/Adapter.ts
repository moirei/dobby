import {
  ModelType,
  AdapterMethod,
  AdapterMethodArgs,
  ModelConstructor,
} from "../types";
import { Query } from "../graphql";
import { Model } from "../Model";

export abstract class Adapter {
  abstract create(
    data: any,
    query: Query<ModelType>,
    model: ModelType
  ): Query<ModelType> | void;
  abstract createMany(
    data: any,
    query: Query<ModelType>,
    model: ModelType
  ): Query<ModelType> | void;
  abstract upsert(
    args: any,
    data: any,
    query: Query<ModelType>,
    model: ModelType
  ): Query<ModelType> | void;
  abstract update(
    args: any,
    data: any,
    query: Query<ModelType>,
    model: ModelType
  ): Query<ModelType> | void;
  abstract findMany(
    query: Query<ModelType>,
    model: ModelType
  ): Query<ModelType> | void;
  abstract findUnique(
    args: any,
    query: Query<ModelType>,
    model: ModelType
  ): Query<ModelType> | void;
  abstract delete(
    args: any,
    query: Query<ModelType>,
    model: ModelType
  ): Query<ModelType> | void;
  abstract $update(
    data: any,
    query: Query<ModelType>,
    model: Model
  ): Query<ModelType> | void;
  abstract $delete(
    query: Query<ModelType>,
    model: Model
  ): Query<ModelType> | void;

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
