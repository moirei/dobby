import { QueryVariable } from "./query";

export type FilterOperation =
  | "startsWith"
  | "endsWith"
  | "equals"
  | "not"
  | "in"
  | "notIn"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "contains"
  | "search";

export type FilterShorthandConditions = "=" | "<" | ">" | "<=" | ">=" | "!=";

export type FilterOperations = {
  [field: string]: FilterOperation;
};

export type FilterOrder = "asc" | "desc";

export type FilterOrdering = {
  [field: string]: FilterOrder | FilterOrdering;
};

export interface FilterConfig {
  take?: number;
  skip?: number;
  where?: FilterOrdering;
  orderBy?: FilterOrdering;
  as?: string | Omit<QueryVariable, "value">;
}

export interface FilterWhereCondition {
  [field: string]:
    | {
        [K in FilterOperation]?: any;
      } & {
        in?: any[];
        notIn?: any[];
      };
}
