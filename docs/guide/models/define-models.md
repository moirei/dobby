# Defining Models

Models essentially describe a GraphQL type with its fields and relationships. Once defined, the model can be used to perform complex queries.

Take this User model as an example


```javascript
import { Model } from "@moirei/dobby";

class User extends Model {
  static fields(f) {
    ...
    f.id()
    f.string('name')
    f.string('email')
    f.json('meta', { watch: true })
  }
}
```


Its fields are `id`, `name` and `email`. Building queries will always ensure only the defined fields are selected.

```javascript
const query = User.select(["id", "name", "email_verified"]);
const selects = query.getSelects(); // returns ["id", "name"]
```


## Relationships

You can define multiple models as related.

Consider the below definitions for [this GraphQL demo](https://graphql-demo.mead.io).

```javascript
class User extends Model {
  static fields(f) {
    f.id()
    f.string('name')
    f.string('email')
    f.model('posts', Post).list()
    f.model('comments', { type: Comment, default: [] })
  }
}

class Post extends Model {
  // eager load author
  static queryRelationships: string[] = ["author"];

  static fields(f) {
    f.id();
    f.string("title");
    f.string("body");
    f.boolean("published");
    f.model("author", User);
    f.list.model("comments", Comment);
  }

  static hooks() {
    return {
      findMany: findManyHook,
    };
  }
}
class Comment extends Model {
  // eager load author
  static queryRelationships: string[] = ["author"];

  static fields(f) {
    f.id();
    f.string("text");
    f.model("post", Post);
    f.model("author", User);
  }
}

const client = new Client({
  url: "https://graphql-demo.mead.io",
});

client.register(User, Post, Comment);
```
> Note that providing array as default will automatically make the field a list


Now uses can be retrieved with

```javascript
const users = await User.findMany();
```

This by default will not include the users' posts and comments. To include these, use the `include` method of the Query Builder

```javascript
const users = await User.select("id", "name")
      .include('posts', ['id', 'title'])
      .include("comments")
      .findMany();
```

Since `Post` model eagerly loads `author`, this will execute the following query

```graphql
query {
  users{
    id, name,
    posts{
      id, title
    }
    comments{
      id, text,
      author{ id, name, email }
    }
  }
}
```
