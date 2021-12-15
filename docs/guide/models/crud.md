# CRUD

Interpretation of the CRUD operations is handled by the client adapter. The default adapter is made for Prisma backends in mind. To customise this behaviour, instantiate the Dobby client with a custom adapter. You can also use Hooks to override operations at individual model level.

The CRUD methods are patterned after the [OpenCRUD](https://www.opencrud.org/) standard.

When using the `create`, `update`, `upsert` methods, ensure the provided input data are properly formatted for your backend.


## Creating Models

```javascript
const user = await User.create(data);
```
The `$save` method may also be used to create instantiated models.

```javascript
const user = new User(data);
await user.$save(data);
```
The `createMany` method can also used to create multiple records.

```javascript
const users = await User.createMany([
  user1Data,
  user2Data,
])
```

The default adapter translates this into a `createManyUsers` mutation.

It's generally important to be able to differentiate created (persisted) records from transient instances. Dobby considers model instances with defined primary keys in the `original` attributes container to be *existing*.

```javascript
const user1 = await User.create(data);
const user2 = new User({ name: 'James Franco' })
const user3 = User.make({ name: 'John Doe' })
const user4 = User.make({ id: 4, name: 'Joe Blow' })

user1.$exists() // returns true
user2.$exists() // returns false
user3.$exists() // returns false
user4.$exists() // returns true
```

Note that the Query Builder automatically adds the primary key field to the query fields such that

```javascript
const user = await User.select('name').create({
  name: 'John Doe',
  email: 'john@domain.com',
})
```

will be executed as

```graphql
mutation ($data: UserCreateInput!){
  createOneUser(data: $data){
    id, name
  }
}
```

The returned value of `id` is used to hidrate the created instance, allowing calling `$exists` on the instance to return `true`.


## Retrieving Models

```javascript
const user = await User.findUnique({ id: 1 });
```

The `find` method can be used instead.

To retrieve multiple records, the `findMany` or `all` methods can be used.

```javascript
const users = await User.findMany();
```

Retrieved user(s) are always of type `User`. However, in some cases you might prefer a basic JSON object. Dobby supplies the `$tojson` method for this.

```javascript
const object = user.$toJson();
```

This will return all attribute values, including the JSON objects of related models.



### Hot Find Unique

To retrieve a model and quickly return an instance while its contents are being fetched, you may use the `hotFindUnque` method.

```javascript
class User extends Model{
  ...
  get $loaded(){
    return !!this.$getKey()
  }
}
```

```javascript
const user = User.hotFindUnque({ id: 1 })
this.$loaded // return false

// wait x ms
this.$loaded // return true
```

This setup may prove useful in reactive frontends.

The method is not included in the Query Builder and can therefore only be used directly from a model class. To provide more query options you pass the a second argument which receives the query.

```javascript
const user = User.hotFindUnque({ id: 1 }, query => {
  query.select('*').include('*')
})
```




## Count

You can also count records with the `count` method. This performs the `findMany` operation with the model's primary key as the only selected field.

```javascript
const count = await User.count()
// or
const count = await User.newQuery().count()

if(count > 0){
  //
}
```


## Updates

```javascript
const user = await User.update({ id: 1 }, data);
```

The `$save` method may also be used to update models.

```javascript
const user = await User.findUnique({ id: 1 });
await user.$save(data);
```

Existing models can also be updated using the `$update` method. However, the below will not trigger an update as no changes has been made to the model.

```javascript
const user = User.make({
  id: 1,
  name: "John",
  email: "john@mail.com"
});
await user.$update();
```
You can also *Update or Create* a record with `upsert`.

```javascript
const user = await User.upsert({
  id: 1,
  name: 'John Doe'
}, {
  name: 'John Doe',
  email: 'john@mail.com',
})
```

This will build and execute the follow query

```graphql
mutation ($where: UserWhereInput!, $data: UserUpdateInput!){
  upsertOneUser(where: $where, data: $data){
    id, name, email
  }
}
```


## Deleting Models

Existing models can be deleted by either using the `delete` method or the `$delete` method directly from the instance.

```javascript
await User.delete({ id: 1 });

// same as
const user = await User.findUnique({ id: 1 })
await user.$delete()
```
