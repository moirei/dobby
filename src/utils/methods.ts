import { isEmpty, isUndefined, keys, upperFirst } from "lodash";
import {
  QueryCallback,
  QueryWhere,
  QueryVariables,
  QueryVariableType,
  QueryField,
  QueryVariable,
  ModelType,
  Hooks,
  MethodArgs,
  Attributes,
} from "../types";
import { Query } from "../graphql";
import { ArgumentsBucket } from "../graphql/ArgumentsBucket";
import { Attribute } from "../attributes";
import { error } from "./errors";
import { isFloat } from ".";
import { Adapter } from "src";

export function isRelationshipField(field: Attribute): boolean {
  return !!field.model;
}

export function addQueryOptions(
  query: Query,
  selects?: string[] | QueryCallback,
  includes?: string[]
): Query {
  if (typeof selects === "function") {
    selects(query);
  } else if (selects) {
    query.select(selects);
    if (includes) {
      includes.forEach((relationship) => query.include(relationship));
    }
  }

  return query;
}

export function resolveValueType(value: any, t: true): string | never;
export function resolveValueType(value: any, t: false): string | false;
export function resolveValueType(value: any): string | false;
export function resolveValueType(
  value: any,
  t?: boolean
): string | false | never {
  switch (typeof value) {
    case "bigint":
    case "number":
      if (isFloat(value)) {
        return "Float";
      }
      return "Int";
    case "string":
      return "String";
    case "boolean":
      return "Boolean";
    default:
      if (t) {
        error("Could not determine type for value: " + value);
      }
      return false;
  }
}

export function resolveType(value: any, type?: string | ModelType): string {
  if (isUndefined(value) && !type) {
    error("Value or type is required.");
  }

  if (typeof type == "string") {
    switch (type.toLocaleLowerCase()) {
      case "int":
      case "integer":
        return "Int";
      case "str":
      case "String":
        return "String";
      default:
        return upperFirst(type);
    }
  } else if (type) {
    return type.name;
  }

  const t: string | false = resolveValueType(value);

  if (t === false) {
    error(`Unknown type ${typeof value}`);
  }

  return t;
}

export function isPremitiveVariable<V extends QueryVariableType>(
  variable: V
): V extends boolean | number | bigint | string ? true : false {
  // @ts-ignore
  return ["bigint", "number", "string", "boolean"].includes(typeof variable);
}

export function resolveQueryVariables(variables: QueryWhere): QueryVariables {
  const vars: QueryVariables = {};
  for (const v in variables) {
    if (isPremitiveVariable(variables[v])) {
      vars[v] = {
        type: "Int",
        required: true,
        value: variables[v],
      };
    } else {
      vars[v] = variables[v] as QueryVariable;
    }
  }

  return vars;
}

export function getOperation(
  field: QueryField,
  variablesBucket: ArgumentsBucket
): string {
  let vars = "";
  const fields: string[] = [];

  field.fields.forEach((field) => {
    if (typeof field === "string") {
      fields.push(field);
    } else {
      fields.push(getOperation(field, variablesBucket));
    }
  });

  if (!isEmpty(field.variables)) {
    const varsList: string[] = [];
    for (const v in field.variables) {
      const key = variablesBucket.add(v, field.variables[v]);
      varsList.push(`${v}: $${key}`);
    }
    vars = `(${varsList.join(",")})`;
  }

  return `${field.operation}${vars}{${fields.join(",")}}`;
}

type WillMutateLifecycleHooks = Pick<Hooks, "$creating" | "$updating">;
export function willMutateLifecycleHook<
  M extends keyof WillMutateLifecycleHooks,
  A extends MethodArgs<WillMutateLifecycleHooks, M>
>(model: ModelType, name: M, args: A): Attributes | false {
  const hook = model.getHook(name) as WillMutateLifecycleHooks[M];

  if (!hook) {
    return args[1] || {};
  }

  const directive = hook(args[0], args[1]);

  if (directive === false) {
    return false;
  }

  return args[1] || {};
}

type MutatedLifecycleHooks = Pick<Hooks, "$created" | "$updated" | "$deleted">;
export function mutatedLifecycleHook<
  M extends keyof MutatedLifecycleHooks,
  A extends MethodArgs<MutatedLifecycleHooks, M>
>(model: ModelType, name: M, args: A) {
  const hook = model.getHook(name) as MutatedLifecycleHooks[M];
  if (hook) {
    hook(args[0]);
  }
}

type WillEraseLifecycleHooks = Pick<Hooks, "$deleting">;
export function willEraseLifecycleHook<
  M extends keyof WillEraseLifecycleHooks,
  A extends MethodArgs<WillEraseLifecycleHooks, M>
>(model: ModelType, name: M, args: A) {
  const hook = model.getHook(name) as WillEraseLifecycleHooks[M];
  if (hook) {
    return hook(args[0]);
  }
}
