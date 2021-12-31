# Configuration

Create a new client and register your models.

Not all your models need to be registered; only ones that execute client queries.

```javascript
import { User, Post, Comment } from '~/models'

const client = new Client();

client.register(User);
client.register(Post);
client.register(Comment);

// or
client.register(User, Post, Comment);

// or
client.register([User, Post, Comment]);
```


## Apollo Client

Dobby uses Apollo Client to execute queries. If not provided, a default client is created with basic configurations.

```javascript
const client = new Client({
  apollo: apolloClient,
});
```


## Adapters

If an adapter is not provided, the `DefaultAdapter` adapter is used.

```javascript
class MyAdapter extends DefaultAdapter{
    ...
}

const client = new Client({
  adapter: new MyAdapter(),
});
```



## Client Config Options



| Option             | Description                                                  | Default       |
| ------------------ | ------------------------------------------------------------ | ------------- |
| `name`             | The client's name. Used to identify multiple clients.        | `Default`     |
| `apollo`           | An optional Apollo client. If your app already has Apollo GraphQL configure, you can provide that instance here. |               |
| `url`              | Used to instantiate an Apollo Link if `link` is not provided. | `/graph`      |
| `credentials`      | The client credentials option. Used to instantiate an Apollo Link if `link` is not provided. | `same-origin` |
| `link`             | Used to instantiate the default Apollo Client if `apollo` is not provided. |               |
| `cache`            | Used as the default cache to instantiate the default Apollo Client if `apollo` is not provided. |               |
| `useGETForQueries` | Use `GET` for queries. Used to instantiate the default Apollo Client if `apollo` is not provided. | `false`       |
| `debugMode`        | Used to instantiate an Apollo Link if `link` is not provided. | `false`       |


