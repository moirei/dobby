import { singular, plural } from "pluralize";
import { upperFirst } from "lodash";
import { ModelType, ModelConstructor } from "../types";
import { Query } from "../graphql";
import { Adapter } from "./Adapter";
import { Model } from "../Model";

export class DefaultAdapter extends Adapter {
  public create(data: any, query: Query<ModelType>, model: ModelType) {
    return this.executeHook(model, "create", [data, query, model], () => {
      const operation = "createOne" + upperFirst(model.entity);
      query
        .where("data", {
          type: upperFirst(model.entity) + "CreateInput",
          required: true,
          value: data,
        })
        .mutation()
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  public createMany(data: any, query: Query<ModelType>, model: ModelType) {
    return this.executeHook(model, "createMany", [data, query, model], () => {
      const operation = "createMany" + plural(upperFirst(model.entity));
      query
        .where("data", {
          type: "[" + upperFirst(model.entity) + "CreateInput!]",
          required: true,
          value: data,
        })
        .mutation()
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  public upsert(
    args: any,
    data: any,
    query: Query<ModelType>,
    model: ModelType
  ): Query<ModelType> | void {
    return this.executeHook(model, "upsert", [args, data, query, model], () => {
      const operation = "upsertOne" + upperFirst(model.entity);
      query
        .where({
          where: {
            type: upperFirst(model.entity) + "WhereInput",
            required: true,
            value: args,
          },
          data: {
            type: upperFirst(model.entity) + "UpdateInput",
            required: true,
            value: data,
          },
        })
        .mutation()
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  public update(
    args: any,
    data: any,
    query: Query<ModelType>,
    model: ModelType
  ): Query<ModelType> | void {
    return this.executeHook(model, "update", [args, data, query, model], () => {
      const operation = "updateOne" + upperFirst(model.entity);
      query
        .where({
          where: {
            type: this.getInputName(model),
            required: true,
            value: args,
          },
          data: {
            type: upperFirst(model.entity) + "UpdateInput",
            required: true,
            value: data,
          },
        })
        .mutation()
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  public findMany(
    query: Query<ModelType>,
    model: ModelType
  ): Query<ModelType> | void {
    return this.executeHook(model, "findMany", [query, model], () => {
      const operation = plural(model.entity).toLocaleLowerCase();
      query
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  public findUnique(args: any, query: Query<ModelType>, model: ModelType) {
    const operation = singular(model.entity).toLocaleLowerCase();
    return this.executeHook(model, "findUnique", [args, query, model], () => {
      query
        .where("where", {
          type: this.getInputName(model),
          required: true,
          value: args,
        })
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  public delete(args: any, query: Query<ModelType>, model: ModelType) {
    return this.executeHook(model, "delete", [args, query, model], () => {
      const operation = "deleteOne" + upperFirst(model.entity);
      query
        .where("where", {
          type: this.getInputName(model),
          required: true,
          value: args,
        })
        .mutation()
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  public $update(
    data: any,
    query: Query<ModelType>,
    model: Model
  ): Query<ModelType> | void {
    return this.executeHook(
      model.$self(),
      "$update",
      [data, query, model],
      () => {
        const operation = "updateOne" + upperFirst(model.$self().entity);
        query
          .where({
            where: {
              type: this.getInputName(model.$self()),
              required: true,
              value: {
                [model.$getKeyName()]: model.$getKey(),
              },
            },
            data: {
              type: upperFirst(model.$self().entity) + "UpdateInput",
              required: true,
              value: data,
            },
          })
          .mutation()
          .operation(operation)
          .parseWith((response) => response.data[operation]);
      }
    );
  }

  public $delete(query: Query<ModelType>, model: Model) {
    return this.executeHook(model.$self(), "$delete", [query, model], () => {
      const operation = "deleteOne" + upperFirst(model.$self().entity);
      query
        .where("where", {
          type: this.getInputName(model.$self()),
          required: true,
          value: {
            [model.$getKeyName()]: model.$getKey(),
          },
        })
        .mutation()
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  protected getInputName(model: ModelType) {
    return upperFirst(model.entity) + "WhereUniqueInput";
  }
}
