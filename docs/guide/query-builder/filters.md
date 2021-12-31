# Filters

Filters allow.

Filters currently doesn't afford query grammar not alternate ways to interpreter operations.



```javascript
User.filter({
    skip: 10,
    take: 5,
    where: {
        //
    },
    as: {
        //
    }
})
// or
User.newQuery().filter({ skip: 5 })
```

You can also specify query fields to select.

```javascript
query.include('posts', ['id', 'name'])
```

The where fil



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

Alternatively, a declarative object can be provided

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
