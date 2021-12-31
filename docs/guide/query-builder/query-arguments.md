# Arguments

Arguments can be assigned to query fields and operations with the `where` method.

```javascript
query.where("id", 1);
```

Primitive values of type `number`, `bigint`, `string`,  and`boolean` are automatically formatted into `Int`, `Float`, etc.

To specifically define the argument, provide a full option

```javascript
query.where('id', {
  type: 'Int',
  required: true,
  value: 1,
})
```

Multiple arguments can also be provided

```javascript
query.where({
  id: 1,
  data: {
    type: 'UserCreateInput',
    required: true,
    value: { ... }
  }
})

// or

query.where('id', 1)
     .where('data', {
        type: 'UserCreateInput',
        required: true,
        value: { ... }
      })
```

