# @moirei/dobby

Dobby is a GraphQL query builder and CRUD client that makes working with graphql data sources and object models enjoyable. It's designed [Prisma](https://www.prisma.io/) and [Laravel Lighthouse](https://lighthouse-php.com/) backends in mind.

```javascript
import User form '~/models/user'
...

const users = await User.select('id', 'name', 'email')
                        .with('posts')
                        .findMany();
```



## Documentation

All documentation is available at [the documentation site](https://moirei.github.io/dobby).


## :green_heart: Unique Features

- Basic **CRUD** operations
- Declarative and extensible Data **Models** and Object-relational mapping
- Flexible **Query Builder** for progressively defining complex query fields and relationships
- Models **Attributes** casting and mutation
- **Adapters** to make working with workspaces and different backends easy
- Model **Hooks** make it possible to further configure how individual models handle common CRUD operations.


## Installation

You can install the package via npm:

```bash
npm i @moirei/dobby
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
