# Conventions

In order to leverage the power of Dobby models, it might be useful to understand some basics.

## Model Key

Model keys are similar to model names in that they're used to identify models. By default, you may not define a model with the same name more than once. Using a key identifyie is a way to define multiple models that share the same name but might have different schemas.

In some cases, especitially when working with multiple client endpoints, you might need to define multiple models with different schemas.

Model 1.

```javascript
export class Address extends Model{
  static get modelKey(){
    return 'UserAddress'
  }

  static fields(f) {
    f.id()
    f.string('street')
    f.string('street_extra')
    ...
  }
}
```

Model 2

```javascript
export class Address extends Model{
  static get modelKey(){
    return 'LocationAddress'
  }

  static fields(f) {
    f.id()
    f.string('line1')
    f.string('line2')
    ...
  }
}
```

Defining the above models at different locations in one application without unique `modelKey` will cause several schema build errors.

With the default adapter, the below will execute a `addresses{ id }` query for either models.

```javascript
const addresses = await Address.select("id").findMany();
```

## Primary Keys

Dobby assumes your models have a primary key named `id`.
When defining your model's primary key, it's recommended to use the `ID` attribute to automatically make it read-only.

```javascript
import { Model } from "@moirei/dobby";

class User extends Model {
  static entity = "User";
  static primaryKey = "handle";

  static fields(f) {
    f.id();

    // Or
    f.id("handle", "ID");
  }
}
```

If you need to retrieve the primary key name or value on a model instance, you may use the `$getKeyName` and `$getKey` methods.

```javascript
const user = new User({ handle: "james-franco" });

user.$getKeyName(); // returns "handle"
user.$getkey(); // returns "james-franco"
```

## Default Selects

By default, all model attributes are selected in queries. For models with large number of attributes, you might want to limit the number of query fields selected by default. E.g. when using the `findMany` method. Use the `queryAttributes` property to specify the default selection.

```javascript
class User extends Model {
  /**
   * Entity name
   */
  static entity = "User";

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
   * Entity name
   */
  static entity = "User";

  /**
   * Attribute relationships that should be eager-loaded.
   */
  static queryRelationships: string[] = ["posts"];
}
```

## Dynamic Query Operations

Enabling dynamic query operations allow you to build and execute queries in style. Assuming you need to perform a query named `subscribedUsers`, you may not necessarily want to create a new Adapter or hook for this.

```javascript
class User extends Model {
  /**
   * Entity name
   */
  static entity = "User";

  /**
   * Allow performing dynamic actions on queries.
   */
  static dynamicQueryOperations: boolean = true;
}
```

Now, the following query can be called without throwing errors

```javascript
await User.select(["id", "name"]).subscribedUsers();
```

This will build and execute the following query

```graphql
query {
  subscribedUsers {
    id
    name
  }
}
```

Likewise a mutation for `subscibeUser` can be

```javascript
await User.where("id", 1).mutation().subscibeUser();
```

This will build and execute the following query

```graphql
mutation ($id: Int) {
  subscibeUser(id: $id)
}
```

## Default Attribute Values

One of the ways to define default values in using the model's `original` attributes bucket. When you create or retrieve a model, the raw values of the retrieved fields are stored here.

```javascript
class User extends Model{
  static entity = 'User';

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
class User extends Model {
  static entity = "User";

  /**
   * The maximum query depth.
   * Used to limit nested included relationships.
   */
  static maxQueryDepth = 3;
}
```

This is ignored when relationships are included manually.

## Make Arguments Required by Default

By default, anonymous variables are automatically parsed. That is, the following query will consider `id` to be an optional variable.

```javascript
await User.where("id", 1).mutate("subscibeUser");
```

```graphql
mutation ($id: Int) {
  subscibeUser(id: $id)
}
```

To make all anonyous variables required by default, set the `argumentRequiredByDefault` property to `true`.

```javascript
class User extends Model{
  static entity = 'User';

  /**
   * Make auto-resolved argument types required by default.
   */
  public static readonly argumentRequiredByDefault = true;
}
```

Now the above mutation with produce a slightly deferent query

```javascript
await User.where("id", 1).mutate("subscibeUser");
```

```graphql
mutation ($id: Int!) {
  subscibeUser(id: $id)
}
```

Note that anonymous variables is only allowed for primitive types.

## Fetch Policy

Models can configure their fetch policy for Apollo Client. By default this is set to `no-cache`. Fetch policies can also be changes at the query level.

```javascript
class User extends Model{
  static entity = 'User';

  /**
   * The default fetch policy for the model.
   */
  public static readonly fetchPolicy = "network-only";
}
```

```javascript
User.query().policy("cache-and-network").findMany();
```

## Attribute Changes

Dobby provides `$isDirty` and `$isClean` methods to help check the state of the a model instance compared to its initiate state when the model was retrieved or created.

```javascript
const user = await User.findUnqiue({ id: 1 });
user.name = "John";

user.$isDirty(); // true
user.$isDirty("name"); // true
user.$isDirty("email"); // false
user.$isClean(); // false

await user.$save();
user.$isDirty(); // false
```

To include dirty state of related models, use the `$isDeepDirty` method.

```javascript
if (user.$isDeepDirty()) {
  //
}
```

If you would like to keep the changes without calling `$save`, you can use the `$keepChanges` method.

```javascript
user.name = "John";
user.$keepChanges();
user.$isDirty(); // false
```

## Copying and Hydration

It is possible to define a model and later hydrate its content with a query result.

```javascript
const user1 = new User({
  id: 1,
  name: "Joe Blow",
});
const user2 = new User();
```

This will perform a `findUnique` operation under the hood and then copy its results.

```javascript
await user2.$hydrateWith({ id: 2 });
```

The `$hydrateWith` method supports arguments similar to the `findUnique` method.

Now that `user2` is hydrate, its content can also be copied to `user1`.

```javascript
user1.$copy(user2);

user1.id; // returns "2"
user1.name; // returns "John Doe"
```

## Comparing Models

Dobby provides methods `$is` and `$isNot` to quickly compare models. It compares the Model keys and primary keys.

```javascript
if (user.$is(anotherUser)) {
  //
}

if (user.$isNot(anotherUser)) {
  //
}
```

## Retrieving Instance Constructor

For convenience, model instances can retrieve their constructor with the provided `$self` method.

```javascript
const user = new User();

user.$self(); // returns "class User extends Model{..}"
```
