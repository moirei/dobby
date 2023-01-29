import { DocumentNode, ExecutionResult } from "graphql";
import { Adapter } from "../adapters/Adapter";
import { FetchPolicy, ErrorPolicy } from "./query";

export interface ClientConfig {
  name?: string;
  graphQlClient: GraphQlClient;
  adapter?: Adapter;
}

type OperationVariables = {
  [key: string]: any;
};

export interface QueryOptions {
  query: DocumentNode;
  variables?: OperationVariables;
  errorPolicy?: ErrorPolicy;
  fetchResults?: boolean;
  context?: any;
  fetchPolicy?: FetchPolicy;
}

export interface MutationOptions {
  mutation: DocumentNode;
  variables?: OperationVariables;
  context?: any;
  fetchPolicy?: FetchPolicy;
}

export interface GraphQlClient {
  query(options: QueryOptions): Promise<ExecutionResult>;
  mutate(options: MutationOptions): Promise<ExecutionResult>;
}
