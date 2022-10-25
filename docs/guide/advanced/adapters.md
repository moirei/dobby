# Adapters

Adapters are what interpret how the final queries for CRUD operations `create`, `createMany`, `upsert`, etc., are built for execution. The default adapter is build for Prisma and [OpenCRUD](https://www.opencrud.org/) convention.

## Default Adapter Interpretations

```javascript
class User extends Model {
  static entity = "User";

  static fields(f) {
    f.id();
    f.string("name");
    f.string("email");
  }
}
```

### Create

```javascript
const user = await User.create(data);
```

```graphql
mutation ($data: UserCreateInput!) {
  createOneUser(data: $data) {
    id
    name
    email
  }
}
```

### Create Many

```javascript
const users = await User.createMany([user1Data, user2Data]);
```

```graphql
mutation ($data: [UserCreateInput!]!) {
  createManyUsers(data: $data) {
    id
    name
    email
  }
}
```

### Upsert

```javascript
const user = await User.upsert(where, data);
```

```graphql
mutation ($where: UserWhereInput!, $data: UserUpdateInput!) {
  upsertOneUser(where: $where, data: $data) {
    id
    name
    email
  }
}
```

### Update

```javascript
const user = await User.update(where, data);
```

```graphql
mutation ($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
  updateOneUser(where: $where, data: $data) {
    id
    name
    email
  }
}
```

### Find Many

```javascript
const users = await User.findMany();
```

```graphql
query {
  users {
    id
    name
    email
  }
}
```

### Find Unique

```javascript
const user = await User.findUnique();
```

```graphql
query ($where: UserWhereUniqueInput!) {
  user(where: $where) {
    id
    name
    email
  }
}
```

### Delete

```javascript
const user = await User.delete(where);
```

```graphql
mutation ($where: UserWhereUniqueInput!) {
  deleteOneUser(where: $where) {
    id
    name
    email
  }
}
```

### Update an existing model

```javascript
const user = await User.findUnique(where);
user.$fill(data);
user.$update();
```

```graphql
mutation ($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
  updateOneUser(where: $where, data: $data) {
    id
    name
    email
  }
}
```

### Delete an existing model

```javascript
const user = await User.findUnique(where);
user.$delete();
```

```graphql
mutation ($where: UserWhereUniqueInput!) {
  deleteOneUser(where: $where) {
    id
    name
    email
  }
}
```
