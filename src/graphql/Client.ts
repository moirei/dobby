import { DocumentNode } from "graphql";
import gql from "graphql-tag";
import * as fetch from "cross-fetch";
import { error } from "../utils";
import {
  ModelType,
  QueryType,
  ClientConfig,
  FetchPolicy,
  GraphQlClient,
} from "../types";
import { Adapter, DefaultAdapter } from "../adapters";

export class Client {
  public readonly name: string;
  public readonly adapter: Adapter;

  /**
   * The ApolloClient instance
   * @type {GraphQlClient}
   */
  public readonly graphQlClient!: GraphQlClient;

  constructor(config: ClientConfig) {
    this.name = config.name || "default";

    if (config.adapter) {
      this.adapter = config.adapter;
    } else {
      this.adapter = new DefaultAdapter();
    }

    if (!config.graphQlClient) {
      error("GraphQL client is required");
    }

    this.graphQlClient = config.graphQlClient;
  }

  /**
   * Registered models.
   */
  public models: Record<string, ModelType> = {};

  /**
   * Register a model to this client.
   *
   * @param {...(ModelType | ModelType[])} models
   */
  public register(...models: (ModelType | ModelType[])[]) {
    models.flat().forEach((model) => {
      this.registerModel(model);
    });
  }

  /**
   * Execute a raw query or mutation.
   *
   * @param {QueryType} type
   * @param {string|DocumentNode} query
   * @param {Record<string, any>} variables
   * @param {FetchPolicy} fetchPolicy
   * @returns
   */
  public async execute(
    type: QueryType,
    query: string | DocumentNode,
    variables?: Record<string, any>,
    fetchPolicy?: FetchPolicy
  ) {
    if (type === QueryType.QUERY) {
      return this.query(query, variables, fetchPolicy);
    }
    if (type === QueryType.MUTATION) {
      return this.mutate(query, variables);
    }

    error(`Query type ${type} not supported or implemented.`);
  }

  /**
   * Execute a raw query.
   *
   * @param {string|DocumentNode} query
   * @param {Record<string, any>} variables
   * @param {FetchPolicy} fetchPolicy
   * @returns
   */
  public async query(
    query: string | DocumentNode,
    variables?: Record<string, any>,
    fetchPolicy?: FetchPolicy
  ) {
    const response = await this.graphQlClient.query({
      query: gql`
        ${query}
      `,
      variables,
      fetchPolicy,
    });

    return response;
  }

  /**
   * Execute a raw mutation.
   *
   * @param {string|DocumentNode} query
   * @param {Record<string, any>} variables
   * @returns
   */
  public async mutate(
    query: string | DocumentNode,
    variables?: Record<string, any>
  ) {
    const response = await this.graphQlClient.mutate({
      mutation: gql`
        ${query}
      `,
      variables,
    });

    return response;
  }

  protected registerModel(model: ModelType) {
    if (!this.models.hasOwnProperty(model.modelKey)) {
      Object.defineProperty(model, "client", {
        value: this,
        writable: false,
        enumerable: false,
        configurable: false,
      });
      this.models[model.modelKey] = model;
    }
  }
}
