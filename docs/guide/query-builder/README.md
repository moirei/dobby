# Query Builder

The query builder is the building block for executing any query or mutation. A query can be started from a Model class using the `select`, `where`, `include`, `includeAll`, `with`, `withAll`, `newQuery` methods.

```javascript
const users = await User.select("id", "name").findMany();
```

A query can also be started for a model using the builder directly.

```javascript
Query.make(User).select("id", "name").findMany();
```
