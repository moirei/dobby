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

* fix: findUnique to use singular
* feat: add `selectAll` method
* feat: Model inheritance return types


## 1.3.0

* feat: add `$fetch` and `$load` methods to Model
* refactor: change how field attributes and relationships are registered
* fix: remove nullable option in attributes
* feat: field definition with decorators
* feat: watchable JSON field attribute


## 1.3.1

* fix: JsonFieldAttribute state to reflect change when dirty
* fix: registering nested relationships via decorators


## 1.3.2

* feat: field attributes to cast values
* fix: Model `$save` method should not update with all attributes

## 1.3.3

* fix: Model `$is` to compare with `Model.modelKey`
* fix: uplift docs
