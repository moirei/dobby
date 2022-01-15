import { isEqual, transform, isObject, get } from "lodash";
import deepmerge from "deepmerge";
import { Attributes } from "./../types";

export const empty = (value: any) => {
  if (typeof value === "boolean") return false;
  if (typeof value === "string") return !value.length;
  if (typeof value === "number") return false;
  return !!value;
};

export const equals = (a: any, b: any) => {
  if (typeof a === "object") {
    if (typeof b !== "object") return false;
    return isEqual(a, b);
  }
  return a === b;
};

export const flattenObject = (object: Attributes): Attributes => {
  var toReturn: Attributes = {};

  for (var i in object) {
    if (!object.hasOwnProperty(i)) continue;

    if (typeof object[i] == "object") {
      var flatObject = flattenObject(object[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + "." + x] = flatObject[x];
      }
    } else {
      toReturn[i] = object[i];
    }
  }
  return toReturn;
};

export const isChanged = (
  original: Attributes,
  attributes: Attributes,
  field?: string
): boolean => {
  if ((!original || !attributes) && !field) return false;
  if (field && !isObject(attributes[field])) {
    if (attributes[field] === undefined) return false;
    return !isEqual(original[field], attributes[field]);
  }

  let changed = false;
  for (const key of Object.keys(attributes)) {
    const a = get(attributes, key);
    const b = get(original, key);
    if (Array.isArray(b)) {
      changed = changed || !isEqual(a, b);
    } else if (isObject(a)) {
      changed = changed || isChanged(a, b);
    } else {
      changed = changed || (!empty(a) && !isEqual(a, b));
    }
    if (changed) break;
  }

  return changed;
};

export function isNonNullObject(obj?: Object) {
  return obj !== null && typeof obj === "object";
}

export function changes(attributes: Attributes, original: Attributes) {
  return transform(attributes, function (result: Attributes, value, key) {
    if (!isEqual(value, original[key])) {
      result[key] =
        isObject(value) && isObject(original[key])
          ? changes(value, original[key])
          : value;
    }
  });
}

/**
 * Deep diff between two object
 * @param  {Attributes} attributes    Object compared
 * @param  {Attributes} original  Object to compare with
 * @return {Object}           Return a new object who represent the diff
 */
export function deepDiff(attributes: Attributes, original: Attributes) {
  return changes(attributes, original);
}

/**
 * Merge two objects
 * @param  {Attributes} a  Object compared
 * @param  {Attributes} b  Object to compare with
 * @return {Object}           Return a new object who represent the diff
 */
export function mergeDeep(a: Attributes, b: Attributes) {
  return deepmerge(a, b, {
    arrayMerge: (_dest, source, _options) => source,
  });
}
