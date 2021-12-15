import { ApolloClient, FetchPolicy } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";
import { Adapter } from "../adapters/Adapter";
import { ModelType } from "src";

export interface ClientConfig<T extends ModelType = any> {
  name?: string;
  apollo?: ApolloClient<any>;
  url?: string;
  credentials?: string;
  adapter?: Adapter;
  link?: ApolloLink;
  cache?: InMemoryCache;
  useGETForQueries?: boolean;
  debugMode?: boolean;
}
