import { FetchPolicy } from "apollo-client";
import mergeDeep from "deepmerge";
import { Query } from "./graphql";
import {
  Attribute,
  BooleanAttribute,
  FloatAttribute,
  ID,
  IntegerAttribute,
  StringAttribute,
  JsonAttribute,
} from "./attributes";
import {
  Attributes,
  Fields,
  FieldCache,
  FieldOptions,
  FieldResolver,
  QueryCallback,
  QueryWhere,
  QueryVariable,
  SelectOptions,
  QueryInclude,
  HookCache,
  ModelType,
  Enumerable,
} from "./types";
import {
  addQueryOptions,
  deepDiff,
  error,
  isChanged,
  isRelationshipField,
} from "./utils";
import { Client } from "./graphql/Client";
import { Adapter } from "./adapters/Adapter";
import { ModelAttribute } from "./attributes/ModelAttribute";
import { cloneDeep, omit } from "lodash";

export abstract class Model {
  [attribute: string]: any;

  /**
   * The model name.
   */
  protected readonly name: string = this.constructor.name;

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
   * The cached attribute fields of the model.
   */
  static cachedFields: FieldCache;

  /**
   * The cached action handlers of the model.
   */
  static cachedHooks?: HookCache;

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

  constructor(attributes: Attributes = {}) {
    this.applyFields();
    this.$fillOriginal(attributes);
  }

  /**
   * Apply the model fields as local properties.
   */
  private applyFields() {
    const fields = this.$fields();
    this.readonlyAttributes = [];
    for (const prop of Object.keys(fields)) {
      const field = fields[prop];
      if (isRelationshipField(field)) {
        Object.defineProperty(this, prop, {
          get: () => this.relationships[prop] || field.getDefault(),
        });
      } else {
        const options: PropertyDescriptor = {
          get: () => this.$getAttribute(prop, field.getDefault()),
        };
        if (field.isReadOnly) {
          this.readonlyAttributes.push(prop);
        } else {
          options["set"] = (value: any) => this.$setAttribute(prop, value);
        }
        Object.defineProperty(this, prop, options);
      }
    }
  }

  /**
   * The definition of the fields of the model.
   */
  static fields(): Fields {
    return {};
  }

  /**
   * Query execution hooks.
   */
  static hooks(): Partial<Adapter> {
    return {};
  }

  /**
   * Define an attribute field.
   *
   * @param {any} value
   * @param {FieldOptions} options
   * @returns {Attribute}
   */
  protected static attr(value?: any, options?: FieldOptions): Attribute {
    return Attribute.make(value, options);
  }

  /**
   * Define a boolean attribute field.
   *
   * @param {boolean} value
   * @param {FieldResolver} options
   * @returns {BooleanAttribute}
   */
  protected static boolean(
    value?: boolean,
    resolver?: FieldResolver
  ): BooleanAttribute {
    return BooleanAttribute.make(value, resolver);
  }

  /**
   * Define a number attribute field.
   *
   * @param {number} value
   * @param {FieldResolver} options
   * @returns {FloatAttribute}
   */
  protected static float(
    value?: number,
    resolver?: FieldResolver
  ): FloatAttribute {
    return FloatAttribute.make(value, resolver);
  }

  /**
   * Define an ID attribute field.
   *
   * @param {string} value
   * @param {FieldResolver} options
   * @returns {ID}
   */
  protected static id(resolver?: FieldResolver): ID {
    return ID.make(resolver);
  }

  /**
   * Define an integer attribute field.
   *
   * @param {number} value
   * @param {FieldResolver} options
   * @returns {IntegerAttribute}
   */
  protected static integer(
    value?: number,
    resolver?: FieldResolver
  ): IntegerAttribute {
    return IntegerAttribute.make(value, resolver);
  }

  /**
   * Define a json attribute field.
   *
   * @param {number} value
   * @param {string} type
   * @returns {JsonAttribute}
   */
  protected static json(value?: number, type?: string): JsonAttribute {
    return JsonAttribute.make(value, type);
  }

  /**
   * Define a string attribute field.
   *
   * @param {string} value
   * @param {FieldResolver} options
   * @returns {StringAttribute}
   */
  protected static string(
    value?: string,
    resolver?: FieldResolver
  ): StringAttribute {
    return StringAttribute.make(value, resolver);
  }

  /**
   * Define a model relationship field.
   *
   * @param {Attributes|Model|null} value
   * @returns {ModelAttribute}
   */
  protected static model(
    model: ModelType,
    value?: Attributes | Model | null
  ): ModelAttribute {
    return ModelAttribute.make(value, model);
  }

  /**
   * Get the Model schema definition from the cache.
   *
   * @return {Fields}
   */
  public static getFields(): Fields {
    if (!this.cachedFields) {
      this.cachedFields = {};
    }

    if (this.cachedFields[this.name]) {
      return this.cachedFields[this.name];
    }

    this.cachedFields[this.name] = this.fields();

    return this.cachedFields[this.name];
  }

  /**
   * Get the Model adapter hooks from the cache.
   *
   * @return {Partial<Adapter>}
   */
  public static getHooks(): Partial<Adapter> {
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
   * Get a field attribute.
   *
   * @param {string} field
   * @return {Attribute|null}
   */
  public static getField(field: string): Attribute | null {
    return this.getFields()[field];
  }

  /**
   * Get a defined hook method.
   *
   * @param {string} hook
   * @return {Adapter}
   */
  public static getHook<K extends keyof Adapter>(
    field: K
  ): Partial<Adapter>[K] {
    return this.getHooks()[field];
  }

  /**
   * Model fields that are relationships.
   */
  public static get fieldRelationships(): string[] {
    const fields = this.getFields();
    const relationships: string[] = [];
    for (const name in this.getFields()) {
      if (isRelationshipField(fields[name])) {
        relationships.push(name);
      }
    }
    return relationships;
  }

  /**
   * Model fields that are attributes.
   */
  public static get fieldAttributes(): string[] {
    const fields = this.getFields();
    const attributes: string[] = [];
    for (const name in this.getFields()) {
      if (!isRelationshipField(fields[name])) {
        attributes.push(name);
      }
    }
    return attributes;
  }

  /**
   * Start a new query.
   *
   * @returns {Query}
   */
  public static newQuery(): Query {
    return Query.make(this, this.dynamicQueryOperations);
  }

  /**
   * Alias of newQuery.
   * Start a new query.
   *
   * @returns {Query}
   */
  public static query(): Query {
    return this.newQuery();
  }

  /**
   * Start a new query with specific fields selected.
   *
   * @param {...string|string[]} selects
   * @returns {Query}
   */
  public static select(...selects: SelectOptions[]): Query {
    return this.newQuery().select(...selects);
  }

  /**
   * Start a new query with specific relationships included.
   *
   * @returns {Query}
   */
  public static include(relationship: string | string[]): Query;
  public static include(
    relationships: Record<string, QueryInclude | boolean>
  ): Query;
  public static include(
    relationship: string,
    selects: QueryInclude | QueryCallback
  ): Query;
  public static include(
    relationship: string,
    selects: string[],
    relationships?: string[]
  ): Query;
  public static include(
    relationship: string | string[] | Record<string, QueryInclude | boolean>,
    selects?: string[] | QueryInclude | QueryCallback,
    relationships?: string[]
  ): Query {
    return this.newQuery().include(
      relationship as any,
      selects as any,
      relationships as any
    );
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
  public static with(
    relationship: string | string[] | Record<string, QueryInclude | boolean>,
    selects?: string[] | QueryInclude | QueryCallback,
    relationships?: string[]
  ): Query {
    return this.include(
      relationship as any,
      selects as any,
      relationships as any
    );
  }

  /**
   * Start a new query with all relationships included.
   *
   * @returns {Query}
   */
  public static includeAll(): Query {
    return this.newQuery().include("*");
  }

  /**
   * Alias of includeAll.
   * Start a new query with all relationships included.
   *
   * @returns {Query}
   */
  public static withAll(): Query {
    return this.includeAll();
  }

  /**
   * Start a new query with arguments provided.
   *
   * @param {string|QueryWhere} argument
   * @param {number|string|QueryVariable} value
   * @returns
   */
  public static where(args: QueryWhere): Query;
  public static where(
    argument: string,
    value: number | string | boolean | QueryVariable
  ): Query;
  public static where(
    argument: string | QueryWhere,
    value?: number | string | boolean | QueryVariable
  ): Query {
    return this.newQuery().where(argument as any, value as any);
  }

  /**
   * Get a new instance of the model.
   *
   * @param {Attributes} attributes
   * @returns
   */
  public static new(attributes: Attributes = {}) {
    // @ts-ignore
    const model: Model = new this(attributes);
    return model;
  }

  /**
   * Make a new instance of the model.
   *
   * @param {Attributes} attributes
   * @returns
   */
  public static make(attributes: Attributes = {}) {
    return this.new(attributes);
  }

  /**
   * Retrieve models.
   *
   * @param {string[]|QueryCallback} selects
   * @param {string[]} includes
   * @returns {Promise<Model[]>}
   */
  public static async findMany(
    selects?: string[] | QueryCallback,
    includes?: string[]
  ): Promise<Model[]> {
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
   * @returns {Promise<Model[]>}
   */
  public static async all(
    selects?: string[] | QueryCallback,
    includes?: string[]
  ): Promise<Model[]> {
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
  public static async findUnique(
    args: number | string | Attributes,
    selects?: string[] | QueryCallback,
    includes?: string[]
  ): Promise<Model | null> {
    const query = this.newQuery();
    addQueryOptions(query, selects, includes);
    return query.findUnique(args);
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
  public static async find(
    args: number | string | Attributes,
    selects?: string[] | QueryCallback,
    includes?: string[]
  ): Promise<Model | null> {
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
  public static async findOrFail(
    where: number | string | Attributes,
    selects?: string[] | QueryCallback,
    includes?: string[]
  ): Promise<Model | never> {
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
  public static async create(data: Attributes = {}): Promise<Model> {
    return this.newQuery().create(data);
  }

  /**
   * Create multiple models.
   *
   * @param {Attributes[]} data
   * @returns {Promise<Model[]>}
   */
  public static async createMany(data: Attributes[]): Promise<Model[]> {
    return this.newQuery().createMany(data);
  }

  /**
   * Create or update a model.
   *
   * @param {number|string|Attributes} args
   * @param {number|string|Attributes} data
   * @returns {Promise<Model>}
   */
  public static async upsert(
    args: number | string | Attributes,
    data: number | string | Attributes
  ): Promise<Model> {
    return this.newQuery().upsert(args, data);
  }

  /**
   * Update a model instance.
   *
   * @param {number|string|Attributes} args
   * @param {number|string|Attributes} data
   * @param {Promise<Model>} model
   */
  public static async update(
    args: number | string | Attributes,
    data: number | string | Attributes
  ) {
    return this.newQuery().update(args, data);
  }

  /**
   * Delete a model instance.
   *
   * @param {number|string|Attributes} args
   * @param {Promise<any>} model
   */
  public static async delete(args: number | string | Attributes) {
    return this.newQuery().delete(args);
  }

  /**
   * Get the constructor of this model.
   */
  public $self(): ModelType {
    return this.constructor as ModelType;
  }

  /**
   * Start a new query.
   *
   * @returns {Query}
   */
  public $newQuery(): Query {
    return this.$self().newQuery();
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
      const field = this.$self().getField(attr);
      if (this.$isWritable(attr) && field) {
        writable[attr] = field.mutator(
          attributes[attr],
          this,
          attr,
          this.attributes
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
  protected $fillOriginal(attributes: Attributes) {
    this.original = mergeDeep(
      this.original,
      this.$filterAttributes(attributes)
    );

    for (const attribute in attributes) {
      if (this.$self().fieldRelationships.includes(attribute)) {
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
  protected $filterAttributes(attributes: Attributes) {
    const data: Attributes = {};
    for (const field in attributes) {
      if (this.$self().fieldAttributes.includes(field)) {
        data[field] = attributes[field];
      }
    }

    return data;
  }

  /**
   * Keep the changes made to the model.
   */
  protected $keepChanges() {
    if (!this.$isDirty()) return false;
    this.original = mergeDeep(this.original, this.changes);
    this.changes = {};
  }

  /**
   * Attach a model relationship.
   *
   * @param {string} relationship
   * @param {Enumerable<Model|Attributes>} data
   */
  public $attach(relationship: string, data: Enumerable<Model | Attributes>) {
    const field = this.$self().getField(relationship);
    if (field && field.model) {
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
  }

  /**
   * Set an attribute value.
   *
   * @param {string} attribute
   * @param {*} value
   * @returns {this}
   */
  public $setAttribute(attribute: string, value: any) {
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
    const field = this.$self().getField(attribute);
    if (!field) return $default;
    return (
      field.accessor(
        this.attributes[attribute],
        this,
        attribute,
        this.attributes
      ) || $default
    );
  }

  /**
   * Save the model.
   */
  public async $save() {
    if (this.$exists()) {
      this.$update(omit(this.attributes, [this.$getKeyName()]));
    } else {
      const data = await this.$self().create(this.attributes);
      this.$fillOriginal(data.$getAttributes());
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
        .update(undefined, this.changes, this)
        .then((update) => {
          this.$keepChanges();
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
   * Compaire the model with another.
   *
   * @param {Model} model
   * @returns {boolean}
   */
  public $is(model: Model): boolean {
    return model instanceof this.$self() && model.$getKey() === this.$getKey();
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
   * Whether the model attributes (or the provided attribute) is clean.
   *
   * @param {string} attribute
   * @returns {boolean}
   */
  public $isClean(attribute?: string): boolean {
    return !this.$isDirty(attribute);
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
  public $toJson() {
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
   * The definition of the fields of the model and its relations.

   @return {Fields}
   */
  public $fields(): Fields {
    return this.$self().getFields();
  }
}
