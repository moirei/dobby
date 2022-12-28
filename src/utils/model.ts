import { Model } from "../Model";
import { Collection } from "../Collection";
import { isString } from "lodash";

/**
 * Extract the items of a array/collection relationship
 * that is being created/updated/deleted
 *
 * @param {Model} model
 * @param {string} attribute
 */
export const extractArrayRelationshipChanges = (
  model: Model,
  attribute: string
): {
  create: Model[];
  update: Model[];
  deleting: Model[];
} => {
  const create: Model[] = [];
  const update: Model[] = [];
  const deleting: Model[] = [];

  const relationships: Collection<Model> | Model[] =
    model.$getChange(attribute) || model.$getOriginal(attribute);

  if (relationships && Array.isArray(relationships)) {
    const isCollection = relationships instanceof Collection;
    const originalItems = isCollection ? relationships.getOriginal() : [];
    const keys = relationships.map((item) => item.$getKey());
    const originalKeys = originalItems.map((item) => item.$getKey());

    type T = Record<string, Model>;

    const all: T = relationships.reduce(
      (acc, f) => ((acc[f.$getKey()] = f), acc),
      originalItems.reduce((acc, f) => ((acc[f.$getKey()] = f), acc), {} as T)
    );

    const inItems = (item: Model) => {
      return keys.includes(item.$getKey());
    };

    const inOriginalItens = (item: Model) => {
      return originalKeys.includes(item.$getKey());
    };

    for (const relationship of Object.values(all)) {
      if (!relationship.$exists()) {
        create.push(relationship);
      } else if (
        isCollection &&
        !inItems(relationship) &&
        inOriginalItens(relationship)
      ) {
        deleting.push(relationship);
      } else if (relationship.$isDeepDirty()) {
        update.push(relationship);
      }
    }
  }

  return {
    create,
    update,
    deleting,
  };
};

/**
 * Get the JSON value of a possiblly stringified JSON
 * @param {*} value
 * @returns {object}
 */
export const jsonValue = <T>(value: T | string): T => {
  if (isString(value)) {
    return JSON.parse(value);
  }
  return value;
};
