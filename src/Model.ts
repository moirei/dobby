import { FetchPolicy } from "apollo-client";
import { cloneDeep, get, isUndefined, omit, pickBy } from "lodash";
import { Query } from "./graphql";
import {
  Attributes,
  QueryCallback,
  QueryWhere,
  QueryVariable,
  SelectOptions,
  QueryInclude,
  HookCache,
  ModelType,
  ModelConstructor,
  Enumerable,
  Hooks,
  Attribute,
  FieldBuilders,
  ModelSchemas,
  ModelRegistries,
  Dictionary,
} from "./types";
import {
  addQueryOptions,
  deepDiff,
  error,
  isChanged,
  mergeDeep,
} from "./utils";
import { Client } from "./graphql/Client";
import { FieldBuilder, FieldAttribute, RelationshipAttribute } from "./fields";

export abstract class Model {
  /**
   * The model's unique identofier.
   */
  static get modelKey() {
    return this.name;
  }

  /**
   * The model's primary key.
   */
  static primaryKey = "id";

  /**
   * Attribute fields to always include in queries by default.
   * Use "*" to select all.
   */
  static queryAttributes: string[] = ["*"];

  /**
   *  Relationship fields to always include in queries by default.
   * Use "*" to include all.
   */
  static queryRelationships: string[] = [];

  /**
   * Allow performing dynamic actions on queries.
   */
  static dynamicQueryOperations = false;

  /**
   * Attributes that are readonly
   */
  protected readonlyAttributes: string[] = [];

  /**
   * Original model attributes data.
   */
  protected original: Attributes = {};

  /**
   * Changed/updated attributes data.
   */
  protected changes: Attributes = {};

  /**
   * The cached action handlers of the model.
   */
  static cachedHooks?: HookCache<any>;

  /**
   * The maximum query depth.
   * Used to limit nested included relationships.
   */
  static maxQueryDepth = 3;

  /**
   * Make auto-resolved argument types required by default.
   */
  public static readonly argumentRequiredByDefault: boolean = false;

  /**
   * The default fetch policy for the model.
   */
  public static readonly fetchPolicy: FetchPolicy = "no-cache";

  /**
   * The API client.
   * Auto injected when the model is registered.
   */
  public static readonly client?: Client;

  /**
   * Associated model relationships.
   */
  protected relationships: Object & Record<string, Enumerable<Model>> = {};

  protected get attributes(): Attributes {
    return mergeDeep(this.original, this.changes);
  }

  /**
   * The field schema builder for the model.
   */
  protected static fieldBuilders: FieldBuilders = {};

  /**
   * The field schema for the model.
   */
  protected static fieldSchema: ModelSchemas = {};

  /**
   * Registered fields to be assigned to the field schema.
   */
  protected static registeredFields: ModelRegistries = {};

  /**
   * The dictionary of booted models.
   */
  protected static booted: Record<string, boolean> = {};

  constructor(attributes: Attributes = {}) {
    this.$boot();
    this.$fillOriginal(attributes);
  }

  /**
   * Bootstrap this model.
   */
  protected $boot(): void {
    if (!this.$self().booted[this.$modelKey]) {
      this.$self().booted[this.$modelKey] = true;
      this.$initialiseFields();
    }
    this.$applyFieldAttributes();
  }

  /**
   * Initialise model fields.
   */
  protected $initialiseFields(): void {
    this.$self().initialiseFields();
  }

  /**
   * Apply the model fields as local properties.
   */
  protected $applyFieldAttributes(): void {
    this.readonlyAttributes = [];

    const fields = this.$getFields();
    for (const name in fields) {
      const field = fields[name];

      if (field.isRelationship) {
        Object.defineProperty(this, name, {
          get: () => this.relationships[name] || field.getDefault(),
          set: (value: any) => null,
        });
      } else {
        const options: PropertyDescriptor = {
          get: () => this.$getAttribute(name, field.getDefault()),
        };
        if (field.isReadonly) {
          this.readonlyAttributes.push(name);
        } else {
          options["set"] = (value: any) => this.$setAttribute(name, value);
        }
        Object.defineProperty(this, name, options);
      }
    }
  }

  /**
   * Register a field attribute
   *
   * @param {string} key
   * @param {FieldAttribute} attribute
   * @return {M}
   */
  static registerFieldAttribute<M extends ModelType>(
    this: M,
    key: string,
    attribute: Attribute | { (): Attribute }
  ): M {
    if (!this.registeredFields) {
      this.registeredFields = {};
    }
    if (!this.registeredFields[this.modelKey]) {
      this.registeredFields[this.modelKey] = {};
    }
    this.registeredFields[this.modelKey][key] = attribute;

    return this;
  }

  /**
   * Get the defined model fields.
   *
   * @return {Dictionary<Attribute>}
   */
  public static getFields(): Dictionary<Attribute> {
    if (!this.fieldSchema[this.modelKey]) {
      this.initialiseFields();
    }

    return this.fieldSchema[this.modelKey];
  }

  /**
   * Get the defined model relationship fields.
   *
   * @return {Dictionary<FieldAttribute>}
   */
  public static getAttributeFields(): Dictionary<FieldAttribute> {
    const fields = this.getFields() as Dictionary<FieldAttribute>;
    return pickBy(fields, (field) => !field.isRelationship);
  }

  /**
   * Get the defined model relationship fields.
   *
   * @return {Dictionary<RelationshipAttribute>}
   */
  public static getRelatioshipFields(): Dictionary<RelationshipAttribute> {
    const fields = this.getFields() as Dictionary<RelationshipAttribute>;
    return pickBy(fields, (field) => field.isRelationship);
  }

  /**
   * Build the schema by evaluating fields and registry.
   */
  protected static initialiseFields(): void {
    if (!this.fieldSchema[this.modelKey]) {
      const builder = this.getSchemaBuilder();
      this.fields(builder);

      this.fieldSchema[this.modelKey] = {};
      const registry = this.registeredFields[this.modelKey];
      const model = this.make();

      for (const key in registry) {
        const attr = registry[key];
        const attribute = typeof attr === "function" ? attr() : attr;
        const native = get(model, key);
        if (!isUndefined(native)) {
          if (isUndefined(attribute.getDefault())) {
            attribute.default(native);
          }
          if (Array.isArray(native)) {
            attribute.list();
          }
        }

        this.fieldSchema[this.modelKey][key] = attribute;
      }
    }
  }

  /**
   * Model fields that are attributes.
   */
  public static get fieldAttributes(): string[] {
    return Object.keys(this.getAttributeFields());
  }

  /**
   * Model fields that are relationships.
   */
  public static get fieldRelationships(): string[] {
    return Object.keys(this.getRelatioshipFields());
  }

  /**
   * Get a field attribute.
   *
   * @param {string} field
   * @return {FieldAttribute|null}
   */
  public static getAttributeField(name: string): FieldAttribute | null {
    return this.getAttributeFields()[name];
  }

  /**
   * Get a relationship attribute.
   *
   * @param {string} name
   * @return {RelationshipAttribute|null}
   */
  public static getRelationshipField(
    name: string
  ): RelationshipAttribute | null {
    return this.getRelatioshipFields()[name];
  }

  /**
   * The field schema builder.
   * @returns {typeof FieldBuilder}
   */
  static fieldBuilder(): typeof FieldBuilder {
    return FieldBuilder;
  }

  /**
   * The field schema builder.
   * @returns {FieldBuilder}
   */
  static getSchemaBuilder(): FieldBuilder {
    if (!this.fieldBuilders[this.modelKey]) {
      this.fieldBuilders[this.modelKey] = new (this.fieldBuilder())(this);
    }

    return this.fieldBuilders[this.modelKey];
  }

  /**
   * The definition of the fields of the model.
   */
  static fields(f: FieldBuilder): void {
    //
  }

  /**
   * Query execution hooks.
   */
  static hooks<T extends ModelType>(this: T): Hooks<T> {
    return {};
  }

  /**
   * Get the Model adapter hooks from the cache.
   *
   * @return {Hooks<T>}
   */
  public static getHooks<T extends ModelType>(this: T): Hooks<T> {
    if (!this.cachedHooks) {
      this.cachedHooks = {};
    }

    if (this.cachedHooks[this.name]) {
      return this.cachedHooks[this.name];
    }

    this.cachedHooks[this.name] = this.hooks();

    return this.cachedHooks[this.name];
  }

  /**
   * Get a defined hook method.
   *
   * @param {string} hook
   * @return {Hooks[K]}
   */
  public static getHook<T extends ModelType, K extends keyof Hooks<T>>(
    this: T,
    field: K
  ): Hooks<T>[K] {
    return this.getHooks()[field];
  }

  /**
   * Start a new query.
   *
   * @returns {Query<ModelConstructor<T>>}
   */
  public static newQuery<T extends ModelType>(this: T): Query<T> {
    return Query.make(this, this.dynamicQueryOperations);
  }

  /**
   * Alias of newQuery.
   * Start a new query.
   *
   * @returns {Query}
   */
  public static query<T extends ModelType>(this: T): Query<T> {
    return this.newQuery();
  }

  /**
   * Start a new query with specific fields selected.
   *
   * @param {...string|string[]} selects
   * @returns {Query<ModelConstructor<T>>}
   */
  static select<T extends ModelType>(
    this: T,
    ...selects: SelectOptions[]
  ): Query<T> {
    return this.newQuery().select(...selects);
  }

  /**
   * Start a new query with all fields selected.
   *
   * @returns {Query}
   */
  static selectAll<T extends ModelType>(this: T): Query<T> {
    return this.select("*");
  }

  /**
   * Start a new query with specific relationships included.
   *
   * @returns {Query}
   */
  public static include<T extends ModelType>(
    this: T,
    relationship: string | string[]
  ): Query<T>;
  public static include<T extends ModelType>(
    this: T,
    relationships: Record<string, QueryInclude | boolean>
  ): Query<T>;
  public static include<T extends ModelType>(
    this: T,
    relationship: string,
    selects: QueryInclude | QueryCallback<ModelConstructor<T>>
  ): Query<T>;
  public static include<T extends ModelType>(
    this: T,
    relationship: string,
    selects: string[],
    relationships?: string[]
  ): Query<T>;
  public static include<T extends ModelType>(
    this: T,
    relationship: string | string[] | Record<string, QueryInclude | boolean>,
    selects?: string[] | QueryInclude | QueryCallback<ModelConstructor<T>>,
    relationships?: string[]
  ): Query<T> {
    return this.newQuery().include(
      relationship as any,
      selects as any,
      relationships as any
    );
  }

  /**
   * Start a new query with all relationships included.
   *
   * @returns {Query<T>}
   */
  public static includeAll<T extends ModelType>(this: T): Query<T> {
    return this.newQuery().include("*");
  }

  /**
   * Alias of include.
   * Start a new query with specific relationships included.
   *
   * @param {string|string[]|Record<string,QueryInclude|boolean>} relationship
   * @param {string[]|QueryInclude|QueryCallback} selects
   * @param {string[]} relationships
   * @returns
   */
  public static with<T extends ModelType>(
    this: T,
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
   * Alias of includeAll.
   * Start a new query with all relationships included.
   *
   * @returns {Query}
   */
  public static withAll<T extends ModelType>(this: T): Query<T> {
    return this.includeAll();
  }

  /**
   * Start a new query with arguments provided.
   *
   * @param {string|QueryWhere} argument
   * @param {number|string|QueryVariable} value
   * @returns
   */
  public static where<T extends ModelType>(this: T, args: QueryWhere): Query<T>;
  public static where<T extends ModelType>(
    this: T,
    argument: string,
    value: number | string | boolean | QueryVariable
  ): Query<T>;
  public static where<T extends ModelType>(
    this: T,
    argument: string | QueryWhere,
    value?: number | string | boolean | QueryVariable
  ): Query<T> {
    return this.newQuery().where(argument as any, value as any);
  }

  /**
   * Get a new instance of the model.
   *
   * @param {Attributes} attributes
   * @returns
   */
  public static make<T>(
    this: ModelConstructor<T>,
    attributes: Attributes = {}
  ): T {
    // @ts-ignore
    return new this(attributes) as InstanceType<M>;
  }

  /**
   * Alias of make.
   * Make a new instance of the model.
   *
   * @param {Attributes} attributes
   * @returns
   */
  public static new<T>(this: ModelConstructor<T>): T {
    return this.make();
  }

  /**
   * Retrieve models.
   *
   * @param {string[]|QueryCallback} selects
   * @param {string[]} includes
   * @returns {Promise<T[]>}
   */
  public static async findMany<T extends Model>(
    this: ModelConstructor<T>,
    selects?: string[] | QueryCallback<ModelConstructor<T>>,
    includes?: string[]
  ): Promise<T[]> {
    const query = this.newQuery();
    addQueryOptions(query, selects, includes);
    return query.findMany();
  }

  /**
   * Alias of findMany.
   * Retrieve models.
   *
   * @param {string[]|QueryCallback} selects
   * @param {string[]} includes
   * @returns {Promise<T[]>}
   */
  public static async all<T extends Model>(
    this: ModelConstructor<T>,
    selects?: string[] | QueryCallback<ModelConstructor<T>>,
    includes?: string[]
  ): Promise<T[]> {
    return this.findMany(selects, includes);
  }

  /**
   * Count models.

   * @returns {number}
   */
  public static async count(): Promise<number> {
    return this.select(this.primaryKey).count();
  }

  /**
   * Find unique model.
   *
   * @param {number|string|Attributes} args
   * @param {string[]|QueryCallback} selects
   * @param {string[]} includes
   * @returns
   */
  public static async findUnique<T extends Model>(
    this: ModelConstructor<T>,
    args: number | string | Attributes,
    selects?: string[] | QueryCallback<ModelConstructor<T>>,
    includes?: string[]
  ): Promise<T | null> {
    const query = this.newQuery();
    addQueryOptions(query, selects, includes);
    return query.findUnique(args);
  }

  /**
   * Hot find unique.
   * Return an instance immediately and hidrate when content is retrieved.
   *
   * @param {QueryWhere} where
   * @param {QueryCallback} callback
   * @param {Attributes} defaults
   * @return {Model}
   */
  static hotFindUnique<T extends Model>(
    this: ModelConstructor<T>,
    where: QueryWhere,
    callback: QueryCallback<ModelConstructor<T>>,
    defaults: Attributes = {}
  ): InstanceType<ModelConstructor<T>> {
    const model = this.make(defaults);
    model.$hydrateWith(where, callback);
    return model;
  }

  /**
   * Alias of findUnique.
   * Find unique model.
   *
   * @param {number|string|Attributes} args
   * @param {string[]|QueryCallback} selects
   * @param {string[]} includes
   * @returns
   */
  public static async find<T extends Model>(
    this: ModelConstructor<T>,
    args: number | string | Attributes,
    selects?: string[] | QueryCallback<ModelConstructor<T>>,
    includes?: string[]
  ): Promise<T | null> {
    return this.findUnique(args, selects, includes);
  }

  /**
   * Find model or fail.
   *
   * @param {number|string|Attributes} where
   * @param {string[]|QueryCallback} selects
   * @param {string[]} includes
   * @returns {Promise<Model | never>}
   */
  public static async findOrFail<T extends Model>(
    this: ModelConstructor<T>,
    where: number | string | Attributes,
    selects?: string[] | QueryCallback<ModelConstructor<T>>,
    includes?: string[]
  ): Promise<T | never> {
    const model = await this.findUnique(where, selects, includes);
    if (!model) {
      error("Model not found");
    }
    return model;
  }

  /**
   * Create a new model.
   *
   * @param {Attributes} data
   * @returns {Promise<Model>}
   */
  public static async create<T extends Model>(
    this: ModelConstructor<T>,
    data: Attributes = {}
  ): Promise<T> {
    return this.newQuery().create(data);
  }

  /**
   * Create multiple models.
   *
   * @param {Attributes[]} data
   * @returns {Promise<Model[]>}
   */
  public static async createMany<T extends Model>(
    this: ModelConstructor<T>,
    data: Attributes[]
  ): Promise<T[]> {
    return this.newQuery().createMany(data);
  }

  /**
   * Create or update a model.
   *
   * @param {number|string|Attributes} args
   * @param {number|string|Attributes} data
   * @returns {Promise<Model>}
   */
  public static async upsert<T extends Model>(
    this: ModelConstructor<T>,
    args: number | string | Attributes,
    data: number | string | Attributes
  ): Promise<T> {
    return this.newQuery().upsert(args, data);
  }

  /**
   * Update a model instance.
   *
   * @param {number|string|Attributes} args
   * @param {number|string|Attributes} data
   * @param {Promise<Model>} model
   */
  public static async update<T extends Model>(
    this: ModelConstructor<T>,
    args: number | string | Attributes,
    data: Attributes
  ): Promise<T> {
    return this.newQuery().update(args, data);
  }

  /**
   * Delete a model instance.
   *
   * @param {number|string|Attributes} args
   * @param {Promise<any>} model
   */
  public static async delete<T extends Model>(
    this: ModelConstructor<T>,
    args: number | string | Attributes
  ) {
    return this.newQuery().delete(args);
  }

  /**
   * Get the constructor of this model.
   */
  public $self<T extends Model>(this: T): ModelConstructor<T> {
    return this.constructor as ModelConstructor<T>;
  }

  /**
   * Get the entity for this model.
   */
  get $modelKey(): string {
    return this.$self().modelKey;
  }

  /**
   * Start a new query.
   *
   * @returns {Query}
   */
  public $newQuery<T extends Model>(this: T): Query<ModelConstructor<T>> {
    return this.$self().newQuery();
  }

  /**
   * Execute a findUnique operation and hidrate with results.
   *
   * @param {number|string|Attributes} args
   * @param {string[]|QueryCallback} selects
   * @param {string[]} includes
   */
  public async $hydrateWith<M extends Model>(
    this: M,
    args: number | string | Attributes,
    selects?: string[] | QueryCallback<ModelConstructor<M>>,
    includes?: string[]
  ): Promise<boolean> {
    const query = this.$newQuery();

    addQueryOptions(query, selects, includes);
    const instance = await query.findUnique(args);

    if (!instance) {
      return false;
    }

    this.$copy(instance);

    return true;
  }

  /**
   * Alias of hydrateWith.
   * Execute a findUnique operation and hidrate with results.
   *
   * @param {number|string|Attributes} args
   * @param {string[]|QueryCallback} selects
   * @param {string[]} includes
   */
  async $hidrateWith<T extends Model>(
    this: T,
    args: number | string | Attributes,
    selects?: string[] | QueryCallback<ModelConstructor<T>>,
    includes?: string[]
  ): Promise<boolean> {
    return this.$hydrateWith(args, selects, includes);
  }

  /**
   * Copy the contents of the model.
   *
   * @param {Model} model
   * @returns {Model}
   */
  public $copy(model: Model): this {
    if (model instanceof this.$self()) {
      this.$fillOriginal(model.$toJson());
    }

    return this;
  }

  /**
   * Fill the model attributes.
   *
   * @param {Attributes} attributes
   * @returns {this}
   */
  public $fill(attributes: Attributes): this {
    const writable: Attributes = {};
    for (const attr in attributes) {
      const field = this.$self().getAttributeField(attr);
      if (this.$isWritable(attr) && field) {
        writable[attr] = field.mutator(
          attributes[attr],
          this,
          attr,
          attributes,
          field
        );
      }
    }
    this.changes = mergeDeep(this.changes, this.$filterAttributes(writable));

    return this;
  }

  /**
   * Fill the model with changed values.
   *
   * @param {Attributes} attributes
   * @returns {this}
   */
  public $fillDiff(attributes: Attributes): this {
    const diff = deepDiff(attributes, this.original);
    return this.$fill(diff);
  }

  /**
   * Fill the original model attributes.
   *
   * @param {Attributes} attributes
   * @returns {this}
   */
  public $fillOriginal(attributes: Attributes): this {
    this.original = mergeDeep(
      this.original,
      this.$filterAttributes(attributes)
    );

    const fieldRelationships = Object.keys(this.$relationshipFields());
    for (const attribute in attributes) {
      if (fieldRelationships.includes(attribute)) {
        if (attributes[attribute]) {
          this.$attach(attribute, attributes[attribute]);
        }
      }
    }

    return this;
  }

  /**
   * Prepare and cast values for filling.
   * Omits unknown fields. Also performs casts on fields.
   *
   * @param {Attributes} attributes
   * @returns {Attributes}
   */
  protected $filterAttributes(attributes: Attributes): Attributes {
    const data: Attributes = {};
    for (const field in attributes) {
      if (this.$self().fieldAttributes.includes(field)) {
        data[field] = attributes[field];
      }
    }

    return data;
  }

  /**
   * Fetch fields and update model.
   *
   * @param {...string|string[]} selects
   * @returns {Promise<this>}
   */
  public async $fetch(...selects: SelectOptions[]): Promise<this> {
    const data = await this.$newQuery()
      .select(...selects)
      // .clearIncludes()
      .findUnique({
        [this.$getKeyName()]: this.$getKey(),
      });

    if (data) {
      this.$fillOriginal(data.$getAttributes());
    }

    return this;
  }

  /**
   * Load relationships and update model.
   *
   * @param {...string|string[]} selects
   * @returns {Promise<this>}
   */
  public async $load(relationship: string | string[]): Promise<this>;
  public async $load(
    relationships: Record<string, QueryInclude | boolean>
  ): Promise<this>;
  public async $load(
    relationship: string,
    selects: QueryInclude | QueryCallback<ModelConstructor<this>>
  ): Promise<this>;
  public async $load(
    relationship: string,
    selects: string[],
    relationships?: string[]
  ): Promise<this>;
  public async $load(
    relationship: string | string[] | Record<string, QueryInclude | boolean>,
    selects?: string[] | QueryInclude | QueryCallback<ModelConstructor<this>>,
    relationships?: string[]
  ): Promise<this> {
    const data = await Model.select(this.$getKeyName())
      .include(relationship as any, selects as any, relationships as any)
      .findUnique({
        [this.$getKeyName()]: this.$getKey(),
      });

    if (data) {
      this.$fillOriginal(data.$getAttributes());
    }

    return this;
  }

  /**
   * Keep the changes made to the model.
   */
  public $keepChanges(): void | false {
    if (!this.$isDirty()) return false;
    this.original = mergeDeep(this.original, this.changes);
    this.changes = {};
  }

  /**
   * Attach a model relationship.
   *
   * @param {string} relationship
   * @param {Enumerable<Model|Attributes>} data
   * @returns {this}
   */
  public $attach(
    relationship: string,
    data: Enumerable<Model | Attributes>
  ): this {
    const field = this.$self().getRelationshipField(relationship);
    if (field) {
      if (field.isList) {
        if (!Array.isArray(data)) {
          error("Cannot assign non-array value to list field");
        }
        this.relationships[relationship] = ((data as Attributes[]) || []).map(
          (attr) =>
            // @ts-ignore
            attr instanceof Model ? attr : field.model.make(attr)
        );
      } else {
        this.relationships[relationship] =
          data instanceof Model ? data : field.model.make(data);
      }
    }

    return this;
  }

  /**
   * Set an attribute value.
   *
   * @param {string} attribute
   * @param {*} value
   * @returns {this}
   */
  public $setAttribute(attribute: string, value: any): this {
    return this.$fill({
      [attribute]: value,
    });
  }

  /**
   * Get an attribute value.
   *
   * @param {string} attribute
   * @param {*} default
   * @returns {this}
   */
  public $getAttribute(attribute: string, $default?: any) {
    const field = this.$self().getAttributeField(attribute);
    if (!field) return $default;
    return (
      field.accessor(
        this.attributes[attribute],
        this,
        attribute,
        this.attributes,
        field
      ) || $default
    );
  }

  /**
   * Write to the changes container.
   *
   * @param {string} attribute
   * @param {*} value
   * @returns {this}
   */
  public $setChangesAttribute(attribute: string, value: any): this {
    const attributes: Attributes = {
      [attribute]: value,
    };
    this.changes = mergeDeep(this.changes, attributes);
    return this;
  }

  /**
   * Save the model.
   */
  public async $save(): Promise<void> {
    if (this.$exists()) {
      await this.$update();
    } else {
      await this.$self().newQuery().create(this.attributes, this);
    }
  }

  /**
   * Update the model.
   *
   * @throws {Error}
   * @param {Attributes} attributes
   * @returns {Promise<any>|never|false}
   */
  public $update(attributes: Attributes = {}): Promise<any> | never | false {
    if (!this.$exists()) {
      error("Cannot update non-existing model.");
    }
    this.$fill(attributes);

    return new Promise((resolve) => {
      this.$newQuery()
        .update(undefined, cloneDeep(this.changes), this)
        .then((update) => {
          resolve(update);
        });
    });
  }

  /**
   * Delete the model.
   *
   * @throws {Error}
   * @returns {Promise<any>|never}
   */
  public $delete(): Promise<any> | never {
    if (!this.$exists()) {
      error("Cannot delete non-existing model.");
    }
    return this.$newQuery().delete(undefined, this);
  }

  /**
   * Get the primary key for the model.
   *
   * @returns {string}
   */
  public $getKeyName(): string {
    return this.$self().primaryKey;
  }

  /**
   * Get the value of the model's primary key.
   *
   * @returns {any}
   */
  public $getKey() {
    return this.$getAttribute(this.$getKeyName());
  }

  /**
   * Get the original attribute value.
   *
   * @param {string} attribute
   * @returns {any}
   */
  public $getOriginal(attribute: string): any {
    return this.original[attribute];
  }

  /**
   * Get all attributes.
   *
   * @returns {Attributes}
   */
  public $getAttributes(): Attributes {
    return this.attributes;
  }

  /**
   * Get change attribute values.
   *
   * @returns {Attributes}
   */
  public $getChanges(): Attributes {
    return this.changes;
  }

  /**
   * Compaire the model with another.
   *
   * @param {Model} model
   * @returns {boolean}
   */
  public $is(model: Model): boolean {
    return (
      model.$self().modelKey === this.$self().modelKey &&
      model.$getKey() === this.$getKey()
    );
  }

  /**
   * Compaire that the model is NOT another.
   *
   * @param {Model} model
   * @returns {boolean}
   */
  public $isNot(model: Model): boolean {
    return !this.$is(model);
  }

  /**
   * Whether the model attributes (or the provided attribute) is dirty.
   *
   * @param {string} attribute
   * @returns {boolean}
   */
  public $isDirty(attribute?: string): boolean {
    if (attribute) {
      return isChanged(this.original, this.changes, attribute);
    }
    return isChanged(this.original, this.changes);
  }

  /**
   * Check dirty state with deep relationships.
   *
   * @returns {boolean}
   */
  public $isDeepDirty(): boolean {
    let isDirty = isChanged(this.original, this.changes);

    if (!isDirty) {
      for (const name of Object.keys(this.relationships)) {
        const relationship = this.relationships[name];
        if (Array.isArray(relationship)) {
          for (const rel of relationship) {
            isDirty = rel.$isDeepDirty();
            if (isDirty) break;
          }
        } else {
          isDirty = relationship.$isDeepDirty();
        }
        if (isDirty) break;
      }
    }

    return isDirty;
  }

  /**
   * Whether the model attributes (or the provided attribute) is clean.
   *
   * @param {string} attribute
   * @returns {boolean}
   */
  public $isClean(attribute?: string): boolean {
    return !this.$isDirty(attribute);
  }

  /**
   * Check clean state with deep relationships.
   *
   * @returns {boolean}
   */
  public $isDeepClean(): boolean {
    return !this.$isDeepDirty();
  }

  /**
   * Whether the attribute is writable.
   *
   * @param {string} attribute
   * @returns {boolean}
   */
  public $isWritable(attribute: string): boolean {
    return (
      this.$self().fieldAttributes.includes(attribute) &&
      !this.readonlyAttributes.includes(attribute)
    );
  }

  /**
   * Whether the model exists (created/saved).
   *
   * @returns {boolean}
   */
  public $exists(): boolean {
    return this.original.hasOwnProperty(this.$self().primaryKey);
  }

  /**
   * Transform the model instance into json object.
   *
   * @returns {Attributes}
   */
  public $toJson(): Attributes {
    const json = cloneDeep(this.attributes);
    for (const name of Object.keys(this.relationships)) {
      const relationship = this.relationships[name];
      if (Array.isArray(relationship)) {
        json[name] = relationship.map((rel) => rel.$toJson());
      } else {
        json[name] = relationship.$toJson();
      }
    }
    return json;
  }

  /**
   * All the defined model fields.

   @return {Dictionary<Attribute>}
   */
  public $getFields(): Dictionary<Attribute> {
    return this.$self().getFields();
  }

  /**
   * The defined model field attributes.

   @return {Dictionary<FieldAttribute>}
   */
  public $attributeFields(): Dictionary<FieldAttribute> {
    return this.$self().getAttributeFields();
  }

  /**
   * The defined model relationship attributes.

   @return {Dictionary<RelationshipAttribute>}
   */
  public $relationshipFields(): Dictionary<RelationshipAttribute> {
    return this.$self().getRelatioshipFields();
  }
}
