# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 1.2.0

- feat: add CHANGELOG.md
- feat: make `$fillOriginal` public
- feat: make `$keepChanges` public
- feat: add `$copy` method
- feat: add `$hydrateWith` method
- feat: add `$hotFindUnique` method
- feat: add lifecycle hooks
- feat: add `$isDeepDirty` method
- feat: add `$getChanges` method

## 1.2.1

- fix: findUnique to use singular
- feat: add `selectAll` method
- feat: Model inheritance return types

## 1.3.0

- feat: add `$fetch` and `$load` methods to Model
- refactor: change how field attributes and relationships are registered
- fix: remove nullable option in attributes
- feat: field definition with decorators
- feat: watchable JSON field attribute

## 1.3.1

- fix: JsonFieldAttribute state to reflect change when dirty
- fix: registering nested relationships via decorators

## 1.3.2

- feat: field attributes to cast values
- fix: Model `$save` method should not update with all attributes

## 1.3.3

- fix: Model `$is` to compare with `Model.modelKey`
- fix: uplift docs

## 1.3.4

- fix: pass actual instance to Query builder when saving non-existing instance
- fix: deep merge array to overwrite target
- feat: add `$setChangesAttribute` method
- fix: `isChanged` util method for changed state of array attributes

## 1.4.0

- feat: ability to get original relationship
- feat: ability to get changed relationship
- feat: ability to manually set relationship fields
- feat: `Collections` for list of Models
- fix: `$isDirty` checks should shallow check relationships
- fix: `$isDirty` checks should pass empty arrays
- fix: `$keepChanges` should effect relationships
- feat: add native `toJSON` to Model
- chore: faker for tests
