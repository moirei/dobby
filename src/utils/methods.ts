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
import { error } from "./errors";
import { isFloat } from ".";
import { Adapter } from "src";

export function addQueryOptions<T extends ModelType>(
  query: Query<T>,
  selects?: string[] | QueryCallback<T>,
  includes?: string[]
): Query<T> {
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

type WillMutateLifecycleHooks<T extends ModelType> = Pick<
  Hooks<T>,
  "$creating" | "$updating"
>;
export function willMutateLifecycleHook<
  T extends ModelType,
  M extends keyof WillMutateLifecycleHooks<T>,
  A extends MethodArgs<WillMutateLifecycleHooks<T>, M>
>(model: ModelType, name: M, args: A): Attributes | false {
  const hook = model.getHook(name) as WillMutateLifecycleHooks<T>[M];

  if (!hook) {
    return args[1] || {};
  }

  const directive = hook(args[0], args[1]);

  if (directive === false) {
    return false;
  }

  return args[1] || {};
}

type MutatedLifecycleHooks<T extends ModelType> = Pick<
  Hooks<T>,
  "$created" | "$updated" | "$deleted"
>;
export function mutatedLifecycleHook<
  T extends ModelType,
  M extends keyof MutatedLifecycleHooks<T>,
  A extends MethodArgs<MutatedLifecycleHooks<T>, M>
>(model: ModelType, name: M, args: A) {
  const hook = model.getHook(name) as MutatedLifecycleHooks<T>[M];
  if (hook) {
    hook(args[0]);
  }
}

type WillEraseLifecycleHooks<T extends ModelType> = Pick<Hooks<T>, "$deleting">;
export function willEraseLifecycleHook<
  T extends ModelType,
  M extends keyof WillEraseLifecycleHooks<T>,
  A extends MethodArgs<WillEraseLifecycleHooks<T>, M>
>(model: ModelType, name: M, args: A) {
  const hook = model.getHook(name) as WillEraseLifecycleHooks<T>[M];
  if (hook) {
    return hook(args[0]);
  }
}
