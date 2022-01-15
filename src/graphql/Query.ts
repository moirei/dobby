import { FetchPolicy } from "apollo-client";
import { has, isArray } from "lodash";
import {
  error,
  resolveValueType,
  resolveQueryVariables,
  getOperation,
  willMutateLifecycleHook,
  mutatedLifecycleHook,
  willEraseLifecycleHook,
} from "../utils";
import {
  QueryVariable,
  QueryWhere,
  SelectOptions,
  QueryCallback,
  QueryInclude,
  ModelType,
  ModelConstructor,
  QueryType,
  QueryArguments,
  QueryRelationships,
  QueryField,
  Attributes,
  QueryFields,
  AdapterMethod,
  AdapterMethodArgs,
} from "../types";
import { ArgumentsBucket } from "./ArgumentsBucket";
import { Client } from "./Client";
import { Adapter } from "../adapters";
import { Model } from "../Model";

interface QueryResponseParser {
  (response?: any): any;
}

export class Query<T extends ModelConstructor<Model>> {
  /**
   * Query arguments.
   */
  protected arguments: QueryArguments = {};

  /**
   * Selected query fields.
   */
  protected selects: string[] = [];

  /**
   * Additional selects query fields.
   */
  protected additionalSelects: string[] = [];

  /**
   * Included query relationships.
   */
  protected relationships: QueryRelationships<T> = {};

  /**
   * Client fetch policy.
   */
  protected fetchPolicy: FetchPolicy;

  /**
   * The query type
   */
  protected queryType: QueryType = QueryType.QUERY;

  /**
   * The preset query operation.
   */
  protected queryOperation?: string;

  /**
   * The maximum query depth.
   */
  protected maxQueryDepth: number;

  /**
   * Make auto-resolved argument types required by default.
   */
  protected argumentRequiredByDefault: boolean = false;

  /**
   * Optioanl query result parser.
   */
  protected parser?: QueryResponseParser;

  /**
   * Get the model adapter.
   */
  protected get adapter(): Adapter | never {
    if (!this.model.client) {
      error("No query client available. Ensure model has been registered.");
    }
    return this.model.client.adapter;
  }

  constructor(
    protected model: T,
    // protected model: ModelType,
    dynamicQueryOperations: boolean = false,
    protected queryDepth: number = 0,
    maxQueryDepth?: number
  ) {
    this.fetchPolicy = model.fetchPolicy;
    this.argumentRequiredByDefault = model.argumentRequiredByDefault;
    this.maxQueryDepth = maxQueryDepth || model.maxQueryDepth;

    if (dynamicQueryOperations) {
      return new Proxy(this, {
        get(query: Query<T>, prop: string) {
          if (prop in query) {
            // @ts-ignore
            return Reflect.get(...arguments);
          }

          return (...args: any) => query.operation(prop).get(...args);
        },
      });
    }
  }

  /**
   * Make a new Query instance.
   *
   * @param {ModelType} model the model entity
   * @param {boolean} queryDepth
   * @returns {Query<T>}
   */
  public static make<T extends ModelConstructor<Model>>(
    model: T,
    dynamicQueryOperations: boolean = false,
    queryDepth: number = 0,
    maxQueryDepth?: number
  ): Query<T> {
    return new Query(model, dynamicQueryOperations, queryDepth, maxQueryDepth);
  }

  /**
   * Add arguments to the query.
   *
   * @param {string|QueryWhere} args
   * @param {number|string|boolean|QueryVariable} value
   */
  public where(args: QueryWhere): Query<T>;
  public where(
    argument: string,
    value: number | string | boolean | QueryVariable
  ): Query<T>;
  public where(
    argument: string | QueryWhere,
    value?: number | string | boolean | QueryVariable
  ): Query<T> {
    if (typeof argument === "string") {
      let options: QueryVariable;
      if (typeof value === "object") {
        options = value;
      } else {
        options = {
          type: resolveValueType(value, true),
          value: value,
          required: this.argumentRequiredByDefault,
        };
      }
      this.arguments[argument] = options;
    } else {
      for (const arg in argument) {
        this.where(arg, argument[arg]);
      }
    }

    return this;
  }

  /**
   * Select fields to include in the query.
   *
   * @param {...SelectOptions[]} selects
   * @returns
   */
  public select(...selects: SelectOptions[]): Query<T> {
    const selected = selects.flat().map((field) => field.trim());
    if (selected.includes("*")) {
      this.selects = this.model.fieldAttributes;
      return this;
    }
    const fields = this.model.fieldAttributes;
    this.selects = selected.filter((field) => fields.includes(field));

    return this;
  }

  /**
   * Select all fields in the query.
   *
   * @param {...SelectOptions[]} selects
   * @returns {Query<T>}
   */
  public selectAll(): Query<T> {
    return this.select("*");
  }

  /**
   * Add fields to include in the query.
   *
   * @param {...SelectOptions[]} selects
   * @returns
   */
  public add(...selects: SelectOptions[]): Query<T> {
    const selected = selects.flat().map((field) => field.trim());
    if (selected.includes("*")) {
      this.additionalSelects = this.model.fieldAttributes;
    } else {
      this.additionalSelects.push.apply(
        this.additionalSelects,
        selected.filter((field) => !this.additionalSelects.includes(field)) // filter out existing values
      );
    }

    return this;
  }

  /**
   * Remove fields to include in the query.
   *
   * @param {...SelectOptions[]} fields
   * @returns
   */
  public remove(...fields: SelectOptions[]): Query<T> {
    const selected = fields.flat().map((field) => field.trim());
    this.selects = this.selects.filter((field) => !selected.includes(field));

    return this;
  }

  /**
   * Include relationships to the query.
   *
   * @param {string|string[]|Record<string,QueryInclude|boolean>} relationship
   * @param {string[]|QueryInclude|QueryCallback} selects
   * @param {string[]} relationships
   */
  public include(relationship: string | string[]): Query<T>;
  public include(
    relationships: Record<string, QueryInclude | boolean>
  ): Query<T>;
  public include(
    relationship: string,
    selects?: QueryInclude | QueryCallback<T>
  ): Query<T>;
  public include(
    relationship: string,
    selects: string[],
    relationships?: string[]
  ): Query<T>;
  public include(
    relationship: string | string[] | Record<string, QueryInclude | boolean>,
    selects?: string[] | QueryInclude | QueryCallback<T>,
    relationships?: string[]
  ): Query<T> {
    if (typeof relationship === "string") {
      if (relationship === "*") {
        this.newRelationships(this.model.fieldRelationships);
        return this;
      }

      if (selects) {
        if (typeof selects === "string") {
          this.includeRelationshipWithFields(relationship, [selects]);
        } else if (isArray(selects)) {
          this.includeRelationshipWithFields(
            relationship,
            selects,
            relationships
          );
        } else if (["object", "function"].includes(typeof selects)) {
          this.includeQueryRelationship(relationship, selects);
        }
      } else {
        this.newRelationship(relationship);
      }
    } else if (isArray(relationship)) {
      if (relationship.includes("*")) {
        this.newRelationships(this.model.fieldRelationships);
      } else {
        this.newRelationships(relationship);
      }
    } else if (typeof relationship === "object") {
      return this.includeDefinedRelationships(relationship);
    }

    return this;
  }

  /**
   * Alias of include.
   * Include relationships to the query.
   *
   * @param {string|string[]|Record<string,QueryInclude|boolean>} relationship
   * @param {string[]|QueryInclude|QueryCallback} selects
   * @param {string[]} relationships
   * @returns
   */
  public with(
    relationship: string | string[] | Record<string, QueryInclude | boolean>,
    selects?: string[] | QueryInclude | QueryCallback<T>,
    relationships?: string[]
  ): Query<T> {
    return this.include(
      relationship as any,
      selects as any,
      relationships as any
    );
  }

  /**
   * Execute "count" operation.
   * @returns {number}
   */
  public async count(): Promise<number> {
    const results = await this.select(this.model.primaryKey).findMany();
    return results.length;
  }

  /**
   * Execute "create" CRUD operation.
   *
   * @param {Attributes} data
   * @param {Promise<M>} model
   * @return {Promise<M>}
   */
  async create<M extends InstanceType<T>>(data: Attributes, m?: M): Promise<M> {
    const model = m || this.model.make();

    const createData = await willMutateLifecycleHook(this.model, "$creating", [
      model,
      data,
    ]);

    if (createData === false) {
      return model;
    }

    const created = await this.callAdapterMethod("create", [
      createData,
      this as any,
      this.model,
    ])
      .add(this.model.primaryKey) // always add primary key to selects
      .get();

    model.$fillOriginal(created);
    mutatedLifecycleHook(this.model, "$created", [model]);

    return model;
  }

  /**
   * Execute "create" CRUD operation.
   *
   * @param {Attributes[]} data
   * @return {Promise<M[]>}
   */
  async createMany<M extends InstanceType<T>>(
    data: Attributes[]
  ): Promise<M[]> {
    const createManyData = data;

    const models: Attributes[] = await this.callAdapterMethod("createMany", [
      createManyData,
      this as any,
      this.model,
    ])
      .add(this.model.primaryKey) // always add primary key to selects
      .get();

    return (models || []).map((model) => this.model.make(model));
  }

  /**
   * Execute "upsert" CRUD operation.
   *
   * @param {number|string|Attributes} args
   * @param {number|string|Attributes} data
   * @return {Promise<M>}
   */
  async upsert<M extends InstanceType<T>>(
    args: number | string | Attributes,
    data: number | string | Attributes
  ): Promise<M> {
    const model: Attributes = await this.callAdapterMethod("upsert", [
      args,
      data,
      this as any,
      this.model,
    ]).get();
    return this.model.make(model);
  }

  /**
   * Execute "update" CRUD operation.
   *
   * @param {number|string|Attributes} args
   * @param {number|string|Attributes} data
   * @param {Promise<T>} model
   */
  async update<M extends InstanceType<T>>(
    args?: number | string | Attributes,
    data?: Attributes,
    model?: M
  ): Promise<M> {
    if (model) {
      const updateData = willMutateLifecycleHook(this.model, "$updating", [
        model,
        data || {},
      ]);
      if (updateData === false) return model;
      await this.callAdapterMethod("$update", [
        updateData,
        this as any,
        model as Model,
      ]).get();

      model.$fill(updateData);
      model.$keepChanges();
    } else {
      const update: Attributes = await this.callAdapterMethod("update", [
        args,
        data,
        this as any,
        this.model,
      ]).get();
      model = this.model.make(update) as M;
    }

    mutatedLifecycleHook(this.model, "$updated", [model]);

    return model;
  }

  /**
   * Execute "findMany" CRUD operation.
   *
   * @return {Promise<M[]}
   */
  async findMany<M extends InstanceType<T>>(): Promise<M[]> {
    const models: Attributes[] = await this.callAdapterMethod("findMany", [
      this as any,
      this.model,
    ]).get();
    return (models || []).map((model) => this.model.make(model));
  }

  /**
   * Execute "findUnique" CRUD operation.
   *
   * @param {any} args
   * @return {Promise<M|null>}
   */
  async findUnique<M extends InstanceType<T>>(args: any): Promise<M | null> {
    const model: Attributes = await this.callAdapterMethod("findUnique", [
      args,
      this as any,
      this.model,
    ]).get();
    if (model) {
      return this.model.make(model);
    }
    return null;
  }

  /**
   * Execute "delete" CRUD operation.
   *
   * @param {number|string|Attributes} args
   * @param {number|string|Attributes} data
   * @param {Promise<any>}
   */
  async delete<M extends InstanceType<T>>(
    args?: number | string | Attributes,
    model?: M
  ) {
    if (model) {
      if (willEraseLifecycleHook(this.model, "$deleting", [model]) === false)
        return model;

      const deleted = await this.callAdapterMethod("$delete", [
        this as any,
        model,
      ]).get();

      mutatedLifecycleHook(this.model, "$deleted", [model]);

      return deleted;
    }
    return this.callAdapterMethod("delete", [
      args,
      this as any,
      this.model,
    ]).get();
  }

  /**
   * Set the query operation.
   *
   * @param {string} operation
   * @returns {Query<T>}
   */
  public operation(operation: string): Query<T> {
    this.queryOperation = operation;
    return this;
  }

  /**
   * Set the query parser function.
   *
   * @param {QueryResponseParser} parser
   * @returns {Query<T>}
   */
  public parseWith(parser: QueryResponseParser): Query<T> {
    this.parser = parser;
    return this;
  }

  /**
   * Set the query type.
   *
   * @param {QueryType} type
   * @returns {Query<T>}
   */
  public type(type: QueryType): Query<T> {
    this.queryType = type;
    return this;
  }

  /**
   * Set the query fetch policy.
   *
   * @param {FetchPolicy} policy
   * @returns {Query<T>}
   */
  public policy(policy: FetchPolicy): Query<T> {
    this.fetchPolicy = policy;
    return this;
  }

  /**
   * Set the query type to be mutation.
   *
   * @returns {Query<T>}
   */
  public mutation(): Query<T> {
    return this.type(QueryType.MUTATION);
  }

  /**
   * Execute the query as a query.
   *
   * @param {string} name
   * @param {string} operationName an optional name for the query
   * @param {QueryWhere} extraVariables any extra variables to add to the query
   */
  public async query(
    name: string,
    operationName?: string | null,
    extraVariables?: QueryWhere
  ) {
    return this.type(QueryType.QUERY)
      .operation(name)
      .get(operationName, extraVariables);
  }

  /**
   * Execute the query as a mutation.
   *
   * @param {string} name
   * @param {string} operationName an optional name for the query
   * @param {QueryWhere} extraVariables any extra variables to add to the query
   */
  public async mutate(
    name: string,
    operationName?: string | null,
    extraVariables?: QueryWhere
  ) {
    return this.type(QueryType.MUTATION)
      .operation(name)
      .get(operationName, extraVariables);
  }

  /**
   * Execute the query.
   *
   * @throws {Error}
   * @param {string} operationName an optional name for the query
   * @param {QueryWhere} extraVariables any extra variables to add to the query
   */
  public async get(
    operationName?: string | null,
    extraVariables?: QueryWhere
  ): Promise<any> {
    if (!this.model.client) {
      error("No client availaible for query.");
    }
    if (this.queryDepth > 0) {
      error("Cannot execute a child query.");
    }

    const query = this.getQuery(operationName, extraVariables);

    const result = await this.model.client.execute(
      this.queryType,
      query.query,
      query.variables,
      this.fetchPolicy
    );

    return this.parser ? this.parser(result) : result;
  }

  /**
   * Whether the query is for a child node.
   *
   * @returns {boolean}
   */
  public isChildNode(): boolean {
    return this.queryDepth > 0;
  }

  /**
   * Get the defined query type.
   *
   * @returns {string}
   */
  public getQueryType(): string {
    return this.queryType;
  }

  /**
   * Get the query arguments.
   *
   * @returns {QueryArguments}
   */
  public getArguments(): QueryArguments {
    return this.arguments;
  }

  /**
   * Get the query fields.
   *
   * @returns {string[]}
   */
  public getSelects(): string[] {
    if (!this.selects.length) {
      // use model defaults if not already set
      this.select(this.model.queryAttributes);
    }

    const selects = this.selects;

    if (this.additionalSelects.length) {
      const fields = this.model.fieldAttributes;
      selects.push.apply(
        selects,
        this.additionalSelects
          .filter((field) => fields.includes(field)) // fitler out non field values
          .filter((field) => !selects.includes(field)) // filter out existing values
      );
    }

    return selects;
  }

  /**
   * Get the query's model relationships.
   *
   * @returns {QueryRelationships}
   */
  public getRelationships(): QueryRelationships<T> {
    if (this.queryDepth < this.maxQueryDepth) {
      this.include(this.model.queryRelationships);
    }
    return this.relationships;
  }

  /**
   * Get the query's model.
   *
   * @returns {ModelType}
   */
  public getModelType(): ModelType {
    return this.model;
  }

  /**
   * Get the executable query string and variables.
   *
   * @param {string} operationName an optional name for the query
   * @param {QueryWhere} extraVariables any extra variables to add to the query
   * @returns
   */
  public getQuery(
    operationName?: string | null,
    extraVariables?: QueryWhere
  ): { query: string; variables: Record<string, any> } {
    if (!this.queryOperation) {
      error("Cannot get query without an operation defined.");
    }

    const type = this.queryType;
    const variablesBucket = new ArgumentsBucket();
    const options = this.getQueryObject(this.queryOperation);
    if (extraVariables) {
      options.variables = {
        ...options.variables,
        ...resolveQueryVariables(extraVariables),
      };
    }
    const fields = getOperation(options, variablesBucket);
    const bucket = variablesBucket.getContent();
    const variables: Record<string, any> = {};
    if (!operationName) operationName = "";

    let vars = "";
    const varsList: string[] = [];

    if (!variablesBucket.isEmpty()) {
      for (const v in bucket) {
        varsList.push(`$${v}: ${bucket[v].name}`);
        variables[v] = bucket[v].value;
      }
      vars = `(${varsList.join(",")})`;
    }

    return {
      query: `${type} ${operationName}${vars}{${fields}}`,
      variables,
    };
  }

  protected newRelationship(name: string): Query<ModelType> | void {
    if (
      !has(this.relationships, name) &&
      this.model.fieldRelationships.includes(name)
    ) {
      const field = this.model.getRelationshipField(name);
      if (field) {
        const query = Query.make(
          field.model,
          false,
          this.queryDepth + 1,
          this.maxQueryDepth
        );

        this.relationships[name] = query as any;
        return query;
      }
    }
  }

  protected newRelationships(names: string[]) {
    names.forEach((name) => this.newRelationship(name));
  }

  protected selectByQuery(selects: QueryInclude): Query<T> {
    if (selects.select) {
      if (typeof selects.select === "string") {
        this.select(selects.select);
      } else if (isArray(selects.select)) {
        this.select(selects.select);
      } else if (typeof selects.select === "object") {
        const toSelect: string[] = [];
        const toRemove: string[] = [];
        for (const field in selects.select) {
          const value = selects.select[field];
          if (value === true) {
            toSelect.push(field);
          } else if (value === false) {
            toRemove.push(field);
          }
        }
        this.select(toSelect);
        this.remove(toRemove);
      }
    }
    if (selects.include) {
      if (typeof selects.include === "string") {
        this.include(selects.include);
      } else if (isArray(selects.include)) {
        this.include(selects.include);
      } else if (typeof selects.include === "object") {
        for (const field in selects.include) {
          const value = selects.include[field];
          if (typeof value === "boolean") {
            if (value === true) {
              this.newRelationship(field);
            } else {
              this.relationships[field] = false;
            }
          } else if (isArray(value)) {
            this.includeRelationshipWithFields(field, value);
          } else {
            this.include(field, value);
          }
        }
      }
    }
    if (selects.where) {
      for (const field in selects.where) {
        this.where(field, selects.where[field]);
      }
    }

    return this;
  }

  protected includeRelationshipWithFields(
    relationship: string,
    selects: string[],
    relationships?: string[]
  ) {
    const query = this.newRelationship(relationship);
    if (query) {
      query.select(selects);
      if (relationships) {
        query.include(relationships);
      }
    }
    return this;
  }

  protected includeQueryRelationship(
    relationship: string,
    includes: QueryInclude | QueryCallback<T>
  ): Query<T> {
    const query = this.newRelationship(relationship);
    if (query) {
      if (typeof includes === "function") {
        includes(query as any);
      } else {
        query.selectByQuery(includes);
      }
    }
    return this;
  }

  protected includeDefinedRelationships(
    relationships: Record<string, QueryInclude | boolean>
  ): Query<T> {
    for (const name in relationships) {
      if (relationships[name] === true) {
        this.newRelationship(name);
      } else if (relationships[name] === false) {
        this.relationships[name] = false;
      } else {
        this.includeQueryRelationship(
          name,
          relationships[name] as QueryInclude
        );
      }
    }

    return this;
  }

  /**
   * Get the query content as structured data.
   *
   * @param {string} operation an operation name. e.g. findManyUsers
   * @returns {QueryField}
   */
  public getQueryObject(operation: string): QueryField {
    const relationships = this.getRelationships();
    const fields: QueryFields = [...this.getSelects()];

    for (const n in relationships) {
      const relationship = relationships[n];
      if (relationship === false) continue;
      fields.push(relationship.getQueryObject(n));
    }

    return {
      operation,
      fields,
      variables: this.arguments,
    };
  }

  protected getClient(): Client | never {
    if (!this.model.client) {
      error(
        "No client available for query model. Make sure the model has been registered."
      );
    }

    return this.model.client;
  }

  protected callAdapterMethod<M extends AdapterMethod>(
    method: M,
    args: AdapterMethodArgs<M>
  ): Query<T> {
    // @ts-ignore
    const query = this.adapter[method](...args) as Query<T>;
    return query || this;
  }
}
