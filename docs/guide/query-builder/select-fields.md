# Select fields

The select methods is used to define the non-relationship fields on a Model to be returned in a query.
When a selection is not specified, the default section in the Model's `queryAttributes` is used. This is configured to all by default.

```javascript
// select a field
User.select('id');

// select multiple fields
User.select('id', 'name', ...);

// select multiple fields with array
User.select(['id', 'name']);
```


## Adding new fields

The select method redefines the query fields. It overrides any previous selections.
To add new fields to existing section, the query builder provides the `add` method.

```javascript
User.select('id').add('name');

// or
User.select('id').add('name', 'email', ...);

// or
User.select('id').add(['name', 'email']);
```


## Select all fields

```javascript
User.select('*');

// or
User.selectAll()
```
