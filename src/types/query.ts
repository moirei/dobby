import { ModelConstructor, ModelType } from "./model";
import { Model } from "./../Model";
import { Query } from "../graphql";

export enum QueryType {
  QUERY = "query",
  MUTATION = "mutation",
  SUBSCRIPTION = "subscription",
}

export type SelectOptions = string | string[];

export interface QueryVariable {
  // name: string;
  type: string;
  required?: boolean;
  value: any;
}

export type QueryArguments = Object & Record<string, QueryVariable>;

export type QueryVariables = Object & Record<string, QueryVariable>;

export type QueryRelationships<M extends ModelConstructor<Model>> = Record<
  string,
  Query<M> | false
>;

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

export interface QueryCallback<M extends ModelType> {
  (query: Query<M>): void | Query<M>;
}

export type FetchPolicy =
  | "cache-first"
  | "network-only"
  | "cache-only"
  | "no-cache"
  | "standby";

export type ErrorPolicy = "none" | "ignore" | "all";
