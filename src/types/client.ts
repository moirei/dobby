import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";
import { Adapter } from "../adapters/Adapter";

export interface ClientConfig {
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
