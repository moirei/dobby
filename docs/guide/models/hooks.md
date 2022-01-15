# Hooks

Hooks made it possible to tune how models respond to how queries are built for CRUD operations and conditions for model lifecycles.

## CRUD Operation Hooks

CRUD operation hooks override the operation definition of the client adapter. For example, the Default Adapter interprets the `create` operation with something that looks like the below

```javascript
const operation = "createOne" + upperFirst(model.name);
query = query
  .where("data", {
    type: upperFirst(model.name) + "CreateInput",
    required: true,
    value: data,
  })
  .mutation()
  .operation(operation)
  .parseWith((response) => response.data[operation]);
```

This means every `create` operation of models using this adapter will build and execute a `createOne[ModelName]` mutation with a required argument named `data` of type `[ModelName]CreateInput`.


```javascript
class Post extends Model {
  ...

  static hooks() {
    return {
      create(data: any, query: Query, model: ModelType): Query | void{
        const operation = "create" + upperFirst(model.name);
        query.where('data', {
          type: upperFirst(model.name) + "CreateInput",
          required: false,
          value: data,
        })
        .mutation()
        .operation(operation)
        .parseWith((response) => response.data[operation]);
      }

      createMany(data: any, query: Query, model: ModelType): Query | void{
        const operation = "create" + plural(upperFirst(model.name));

		    // create and return a completely new query
        return model.newQuery()
          .select('*')
          .where("data", {
            type: "[" + upperFirst(model.name) + "CreateInput]",
            required: false,
            value: data,
          })
          .mutation()
            .operation(operation)
            .parseWith((response) => response.data[operation]);
          }
    };
  }
}
```

The above slightly changes the behaviour of the `create` and `createMany` operations only for the `Post` model.

Currently all adapter methods are overridable.

> Note that hooks completely override adapter methods.



## Lifecycle Hooks

Lifecycle hooks are called before or after a `create`, `update` or `delete` operation. This gives you the opportunity to further modify mutation data or completely abort the operation.

Here is an example of a `Location` model that has an `Address` model. Changes might have been made to an instantiated location's address directly.

```javascript
const location = await Location.with('address').findUnique({ id: 1 })

location.address.is_public = false
location.$save()
```

In this case,

```javascript
location.$isDirty() // returns false
location.$isDeepDirty() // return true
```

Now, to save the location and the changes made to its address, supply an `$updating` hook to make changes to the update data.

```javascript
class Location extends Model {
  static primaryKey = 'handle'
  ...

  static hooks() {
    return {
      $updating(model: Location, data: Attributes) {
        if (model.address && model.address.$isDirty()) {
          data.address = {
            update: model.address.$getChanges(),
          }
        }
      },
    }
}
```



## Available lifecycle hooks

```javascript
class Location extends Model {
  ...

  static hooks() {
    return {
      $creating(model: Model, data: Attributes): void | Attributes | false{
        //
      },

      $created(model: Model): void{
        //
      },

      $updating(model: Model, data: Attributes): void | Attributes | false{
        //
      },

      $updated(model: Model): void{
        //
      },

      $deleting(model: Model): void | false{
        //
      },

      $deleted(model: Model): void{
        //
      },
    }
}
```

When `false` is returned at `$creating`,  `$updating` and `$deleting`, the operation is aborted.

> Note that `$creating` and `$created` hooks are not triggered when using `createMany`.



