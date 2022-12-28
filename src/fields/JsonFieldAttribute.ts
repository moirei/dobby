import { get } from "lodash";
import { jsonValue } from "../utils/model";
import { Model } from "../Model";
import FieldAttribute from "./FieldAttribute";
const Observer = require("observable-slim");

export default class JsonFieldAttribute extends FieldAttribute {
  protected watchChange = false;

  constructor(key: string, type: string | { type?: string; watch?: boolean }) {
    super(key);
    this.type = (typeof type === "string" ? type : type.type) || "Json";
    this.watchChange = (typeof type === "string" ? false : type.watch) || false;
  }

  /**
   * Watch changes on JSON objects.
   * Changes made to the object fields are auto reflect in the model.
   *
   * @param {boolean} watch
   * @returns {this}
   */
  public watch(watch: boolean = true) {
    this.watchChange = watch;
    return this;
  }

  /**
   * The attribute mutator.
   *
   * @param {Object} value
   * @param {Model} model
   * @param {string} key
   * @returns
   */
  public mutator = (value: Object, model: Model, key: string) => {
    const json = this.getJsonAttributeValue(key, model, () =>
      get(model, key, {})
    );
    Object.assign(json, value);
    return JSON.stringify(json);
  };

  /**
   * The attribute accessor.
   *
   * @param {Object} value
   * @param {Model} model
   * @param {string} key
   * @returns
   */
  public accessor = (value: string, model: Model, key: string) => {
    const json = this.getJsonAttributeValue(key, model, () => jsonValue(value));
    if (model.$isDirty(key)) {
      const original = model.$getOriginal(key);
      if (original) {
        Object.assign(json, jsonValue(value));
      }
    }
    return json;
  };

  protected getJsonAttributeValue<T>(
    name: string,
    model: Model,
    callback: () => T
  ): T {
    const accessKey = "$" + name + "JsonProxy";

    if (!model.hasOwnProperty(accessKey)) {
      const json = callback();
      if (json && !model.hasOwnProperty(accessKey)) {
        if (this.watchChange) {
          const proxy = Observer.create(json, false, () => {
            model.$setAttribute(name, json);
          });
          Object.defineProperty(model, accessKey, {
            get: () => proxy,
          });
        } else {
          Object.defineProperty(model, accessKey, {
            get: () => json,
          });
        }
      }
    }

    return get(model, accessKey);
  }
}
