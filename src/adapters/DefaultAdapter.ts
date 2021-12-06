import pluralize from "pluralize";
import { upperFirst } from "lodash";
import { ModelType } from "../types";
import { Query } from "../graphql";
import { Adapter } from "./Adapter";
import { Model } from "../Model";

export class DefaultAdapter extends Adapter {
  public create(data: any, query: Query, model: ModelType) {
    return this.executeHook(model, "create", [data, query, model], () => {
      const operation = "createOne" + upperFirst(model.name);
      query
        .where("data", {
          type: upperFirst(model.name) + "CreateInput",
          required: true,
          value: data,
        })
        .mutation()
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  public createMany(data: any, query: Query, model: ModelType) {
    return this.executeHook(model, "createMany", [data, query, model], () => {
      const operation = "createMany" + pluralize(upperFirst(model.name));
      query
        .where("data", {
          type: "[" + upperFirst(model.name) + "CreateInput!]",
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
    query: Query,
    model: ModelType
  ): Query | void {
    return this.executeHook(model, "upsert", [args, data, query, model], () => {
      const operation = "upsertOne" + upperFirst(model.name);
      query
        .where({
          where: {
            type: upperFirst(model.name) + "WhereInput",
            required: true,
            value: args,
          },
          data: {
            type: upperFirst(model.name) + "UpdateInput",
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
    query: Query,
    model: ModelType
  ): Query | void {
    return this.executeHook(model, "update", [args, data, query, model], () => {
      const operation = "updateOne" + upperFirst(model.name);
      query
        .where({
          where: {
            type: this.getInputName(model),
            required: true,
            value: args,
          },
          data: {
            type: upperFirst(model.name) + "UpdateInput",
            required: true,
            value: data,
          },
        })
        .mutation()
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  public findMany(query: Query, model: ModelType): Query | void {
    return this.executeHook(model, "findMany", [query, model], () => {
      const operation = pluralize(model.name).toLocaleLowerCase();
      query
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }

  public findUnique(args: any, query: Query, model: ModelType) {
    const operation = "findOne" + upperFirst(model.name);
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

  public delete(args: any, query: Query, model: ModelType) {
    return this.executeHook(model, "delete", [args, query, model], () => {
      const operation = "deleteOne" + upperFirst(model.name);
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

  public $update(data: any, query: Query, model: Model): Query | void {
    return this.executeHook(
      model.$self(),
      "$update",
      [data, query, model],
      () => {
        const operation = "updateOne" + upperFirst(model.$self().name);
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
              type: upperFirst(model.$self().name) + "UpdateInput",
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

  public $delete(query: Query, model: Model) {
    return this.executeHook(model.$self(), "$delete", [query, model], () => {
      const operation = "deleteOne" + upperFirst(model.$self().name);
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
    return upperFirst(model.name) + "WhereUniqueInput";
  }
}
