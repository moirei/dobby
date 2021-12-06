# Conventions

In order to leverage the power of Dobby models, it might be useful to understand some basics.



## Primary Keys

Dobby assumes your models have a primary key named `id`.
When defining your model's primary key, it's recommended to use the `ID` attribute to define this field to automatically make it read-only.

```javascript
import { Model } from '@moirei/dobby'

class User extends Model{
  /**
   * The model's primary key.
   */
  static primaryKey = "handle";

  static fields() {
    return {
      handle: this.id(),
    };
  }
}
```



## Default Selects

By default, all model attributes are select in queries. For models with large number of attributes, you might want to limit the number of query fields selected by default. E.g. when using the `findMany` method. Use the `queryAttributes` property to specify the default selection.

```javascript
class User extends Model {
  /**
   * Attributes to always include in queries by default.
   */
  static queryAttributes: string[] = ["id", "name"];
}
```



## Eager Loading

By default, all relationships are excluded in queries. Use the `queryRelationships` property to automatically include relationships in queries.

```javascript
class User extends Model {
  /**
   * Attribute relationships that should be eager-loaded.
   */
  static queryRelationships: string[] = ["posts"];
}
```



## Dynamic Query Operations

Enabling dynamic query operations allow you to build and execute queries in style. Assuming you need to perform a mutation named `subscibeUser`, you may not necessarily want to create a new Adapter or hook for this.

```javascript
class User extends Model{
  /**
   * Allow performing dynamic actions on queries.
   */
  static dynamicQueryOperations: boolean = true;
}
```

Now, the following query can be called without throwing errors

```javascript
await User.where('id', 1).mutation().subscibeUser()
```

This will build and execute the following query

```graphql
mutation ($id: Int){
  subscibeUser(id: $id)
}
```



## Default Attribute Values

When you create or retrieve a model, the raw values of the retrieved fields are stored in the model's `original`  container.

```javascript
class User extends Model{
  protected original = {
    email_verified: false
  }
}
```

> Avoid setting default values to primary keys.

Defaults can also be set at the field definition level.



## Maximum Query Depth

With eager loading enabled, related models are automatically included to queries. By default this is limited to 3 degrees.

```javascript
class User extends Model{
  /**
   * The maximum query depth.
   * Used to limit nested included relationships.
   */
  static maxQueryDepth = 3;
}
```



## Make Arguments Required by Default

With eager loading enabled, related models are automatically included to queries. By default this is limited to 3 degrees.

```javascript
class User extends Model{
  /**
   * Make auto-resolved argument types required by default.
   */
  public static readonly argumentRequiredByDefault = true;
}
```

Set to true, the above mutation with produce a slightly deferent query

```javascript
await User.where('id', 1).mutate('subscibeUser')
```

```graphql
mutation ($id: Int!){
  subscibeUser(id: $id)
}
```



## Fetch Policy

Models can configure their fetch policy for Apollo Client. By default this is set to `no-cache`. Fetch policies can also be changes at the query level.



```javascript
class User extends Model{
  /**
   * The default fetch policy for the model.
   */
  public static readonly fetchPolicy = "network-only";
}
```

```javascript
User.query().policy('cache-and-network').findMany()
```



## Attribute Changes

Dobby provides `$isDirty` and `$isClean` methods to help check the state of the a model instance compared to its initiate state when the model was retrieved or created.

```javascript
const user = await User.findUnqiue({ id: 1 })
user.name = 'John'

user.$isDirty(); // true
user.$isDirty('name'); // true
user.$isDirty('email'); // false
user.$isClean(); // false

await user.$save();
user.$isDirty(); // false
```



## Comparing Models

Dobby provides methods `$is` and `$isNot` to quickly compare models. It compares the model types and primary keys.

```javascript
if (user.$is(anotherUser)) {
  //
}

if (user.$isNot(anotherUser)) {
  //
}
```

