# Field Decorators

Property decorators provide Typescript users a better typing support when defining model fields. With decorators, class properties can be registered as field attributes or relationships.

```javascript
import { Model, id, string } from '@moirei/dobby'

class User extends Model {
  @id()
  readonly id: string

  @string()
  name: string

  @string()
  email: string

  @string()
  tags: string[] = []
}
```


## Attribute decorators
### @attr
Registers a property as an attribute field.

```javascript
class User extends Model {
  @attr()
  name: string

  @attr({ type: 'String' })
  email: string
}
```

### @boolean
Registers a property as a `Boolean` attribute field.

```javascript
class User extends Model {
  @boolean()
  verified: boolean = false

  @boolean()
  active: boolean

  @boolean({ default: false })
  admin: boolean

  @boolean(false)
  local: boolean
}
```
Properties `verified`, `admin` and `local` will be registered with default value `false`.

### @float
Registers a property as a `Float` attribute field.

```javascript
class User extends Model {
  @float()
  visits: number
}
```
Field default and options can be provided just like `@boolean` above.

### @id
Registers a property as an `ID` attribute field.

```javascript
class User extends Model {
  @id()
  id: number | string
}
```
Alternative type name can be provided as an argument.

### @integer
Registers a property as a `Int` attribute field. Similar to `@float`.

```javascript
class User extends Model {
  @integer()
  visits: number
}
```

### @json
Registers a property as a `Json` attribute field.
Using `@json` does not allow lists.

```javascript
class User extends Model {
  @json()
  meta: Record<string, any> = {}
}
```
Alternative type name can be provided as an argument.

### @string
Registers a property as a `String` attribute field.
Field default and options can be provided similar to the above examples.

```javascript
class User extends Model {
  @string()
  name: string

  @string('PENDING')
  status: string

  @string()
  tags: string[] = []

  @string(options)
  otherField: string
}
```


## Relationship decorators

### @model
Registers a property as a Model relationship field.

```javascript
class User extends Model {
  @model(() => Post)
  post: Post

  @model(() => Address, { list: true })
  addresses: Address[]

  @model(() => Comments)
  post: Comments[] = []
}
```
