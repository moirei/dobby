# CRUD

Interpretation of the CRUD operations is handled by the client adapter. The default adapter is made for Prisma backends in mind. To customise this behaviour, instantiate the Dobby client with a custom adapter. You can also use Hooks to override operations at individual model level.

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




## Retrieving Models

```javascript
const user = await User.findUnique({ id: 1 });
```

The `find` method can be used instead. 

To retrieve multiple records, the `findMany` or `all` methods can be used. 

```javascript
const users = await User.findMany();
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

