# Dynamic Query Operations

Being able to execute query operations dynamically means you're not restricted to the preset CRUD operations.

```javascript
class Post extends Model{
    static dynamicQueryOperations: boolean = true;
    ...
}

...
const response = await Post.where('id', 1)
                    .select(['id', 'title'])
                    .mutation() // query types is by default set to "query"
                    .publishPost()
```

This will generate and execute the following query.

```graphql
mutation($id: Int!) {
  publishPost(id: $id) {
    id
    title
  }
}
```

With the variables.

```json
{
  "id": 1
}
```

Note that the above example is the same as the below without dynamic operations enabled.

```javascript
const response = await Post.where("id", 1)
  .select(["id", "title"])
  .mutate("publishPost");
```
