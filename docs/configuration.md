# Configuration

Create a new client and register your models.

Not all your models need to be registered; only ones that execute client queries.

```javascript
import { User, Post, Comment } from "~/models";

const apolloClient = new ApolloClient({
  ...
});

const client = new Client({
  graphQlClient: apolloClient, // accepts Apollo Client or and instance of GraphQlClient
});

client.register(User);
client.register(Post);
client.register(Comment);

// or
client.register(User, Post, Comment);

// or
client.register([User, Post, Comment]);
```

## Adapters

If an adapter is not provided, the `DefaultAdapter` adapter is used.

```javascript
class MyAdapter extends DefaultAdapter{
    ...
}

const client = new Client({
  ...
  adapter: new MyAdapter(),
});
```

## Client Config Options

| Option          | Description                                            | Required |
| --------------- | ------------------------------------------------------ | -------- |
| `name`          | The client's name. Used to identify multiple clients.  | False    |
| `graphQlClient` | The GraphQL client to be used. Accepts Apollo GraphQL. | True     |
| `adapter`       | Optional adapater for building queries.                | False    |
