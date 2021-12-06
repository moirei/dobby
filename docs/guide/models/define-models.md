# Defining Models

Models essentially descript a GraphQL type with its fields and relationships. Once defined, the model can be used to perform complex queries.

Take this User model as an example


```javascript
import { Model } from "@moirei/dobby";

class User extends Model {
  static fields() {
    return {
      id: this.id(),
      name: this.string(),
      email: this.string()
    };
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
  static fields() {
    return {
      id: this.string(),
      name: this.string(),
      email: this.string(),
      posts: this.model(Post).list(),
      comments: this.model(Comment).list(),
    };
  }
}

class Post extends Model {
  // eager load author
  static queryRelationships: string[] = ["author"];

  static fields() {
    return {
      id: this.string(),
      title: this.string(),
      body: this.string(),
      published: this.boolean(),
      author: this.model(User),
      comments: this.model(Comment).list(),
    };
  }

  static hooks() {
    return {
      findMany: findManyHook,
    };
  }
}
class Comment extends Model {
  static fields() {
    return {
      id: this.string(),
      text: this.string(),
      post: this.model(Post).list(),
      author: this.model(User),
    };
  }
}

const client = new Client({
  url: "https://graphql-demo.mead.io",
});

client.register(User, Post, Comment);
```



Now uses can be retrieved with

```javascript
const users = await User.findMany();
```

This by default will not include the users' posts. To include posts, use the `include` method of the Query Builder

```javascript
const users = await User.select("id", "name")
      .include("comments")
      .findMany();
```

Since `Post` model eagerly loads `author`, this will execute the following query

```graphql
query {
  users{
    id, name, 
    comments{ 
      id, text,
      author{ id, name, email }
    }
  }
}
```



