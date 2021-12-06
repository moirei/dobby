# Relationships

By default relationships included in queries are those specified by the model's `queryRelationships` option.

The include a related model in a query, the `include` or `with` methods can be used.

```javascript
User.include('posts')
// or
User.newQuery().include('posts')
```

You can also specify query fields to select.

```javascript
query.include('posts', ['id', 'name'])
```



## Including All Relationships

To include all relationships with their default configuration, use the wildcard syntax.

```javascript
query.include('*')

// or
query.includeAll()
```


## Advanced Subqueries

Included relationship's queries can be further defined with a callback as the second argument

```javascript
query.include("posts", (query) => {
  query.select("id", "title")
       .include("comments");
});
```

Alternative, a declarative object can be provided

```javascript
query.include("posts", {
  where: {
    id: 1,
    where: {
      type: "PostWhereUniqueInput",
      required: true,
      value: {
        id: 2,
      },
    },
  },
  select: {
    id: true,
    content: true,
  },
  // or
  select: ['id', 'content'],
  include: {
    publisher: true,
    comments: {
      id: true,
      text: true,
    }
  },
  // or
  include: ['publisher', 'comments']
})
```

Multiple includes can also be made with

```javascript
query.include({
  posts: ['id', 'title'],
  comments: {
    select: ['id', 'text'],
    include: ['author'],
  }
})
```
