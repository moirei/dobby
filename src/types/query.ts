import { Query } from "../graphql";

export enum QueryType {
  QUERY = "query",
  MUTATION = "mutation",
  SUBSCRIPTION = "subscription",
}

export type QueryOptions = {
  select?: string[];
  include?: string[];
};

export type SelectOptions = string | string[];

export interface QueryVariable {
  // name: string;
  type: string;
  required?: boolean;
  value: any;
}

export type QueryArguments = Object & Record<string, QueryVariable>;

export type QueryVariables = Object & Record<string, QueryVariable>;

export type QueryRelationships = Record<string, Query | false>;

export type QueryVariableType =
  | boolean
  | number
  | bigint
  | string
  | QueryVariable;

export type QueryWhere = {
  [field: string]: number | string | boolean | QueryVariable;
};

export type QueryFields = (string | QueryField)[];

export interface QueryField {
  operation: string;
  fields: QueryFields;
  variables?: Record<string, QueryVariable>;
}

export type ParsedQueryVariables = Object &
  Record<
    string,
    {
      name: string; // e.g. "ID!"
      value: any;
    }
  >;

export type QuerySelect = string[] | { [field: string]: boolean };

export type QueryIncludeSelect =
  | string[]
  | { [field: string]: boolean | string[] | QueryInclude };

export interface QueryInclude {
  where?: QueryWhere;
  select?: QuerySelect;
  include?: QueryIncludeSelect;
  // orderBy?: {
  //     [field: string]: 'asc' | 'desc';
  // };
}

export interface QueryCallback {
  (query: Query): void | Query;
}
