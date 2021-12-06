# Hooks

Hooks make it possible to redefine how queries for CRUD operations are built.

For example, the default Adapter interprets the `create` operation with something that looks like the below

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