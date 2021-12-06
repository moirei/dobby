# Fields & Attributes


## Model Fields

Fields are essentially the GraphQL fields of the model. When defining fields, they can be setup with default values, type name, accessors & mutations.

```javascript
class User extends Model {
  static fields() {
    return {
      id: this.attr(null, { type: 'String' }).readonly(),
      name: this.attr('', { type: 'String', get: (value) => value.toUpperCase() }),
      email: this.attr('', { type: 'String' }),
      posts: this.attr(null, { type: User }).list(), // a relationship field
    };
  }
}
```

The above can also be be defined using the inbuilt attributes.

```javascript
class User extends Model {
  static fields() {
    return {
      id: this.id(),
      name: this.string('', (value) => value.toUpperCase()),
      email: this.string(),
      posts: this.model(Post).list(),
    };
  }
}
```

In either case, the below model will behave the same.

```javascript
const user = new User({
    id: 1,
    name: 'John Doe',
    email: 'john@mail.com',
})

const userId = user.id; // returns "1"
const userName = user.name; // returns "JOHN DOE"
```



## Attributes

### Accessors & Mutators

Model fields are automatically available as attributes. However, the way the are accesses can be manipulated. For example, the classic `first_name`, `last_name` to compute `name` can be achieved using getters.

```javascript
class User extends Model {
  get name(){
      return [this.first_name, this.last_name].join(' ')
  }
  set name(name){
      const [first_name, last_name] = name.split(' ')
      this.first_name = first_name
      this.last_name = last_name
  }
    
  static fields() {
    return {
      ...
      fist_name: this.string(),
      last_name: this.string(),
    };
  }
}
```



Defined fields can also have their own getters and setters. Take a Json Scalar field for example,

```javascript
class User extends Model {
  static fields() {
    return {
      ...
      meta: this.attr(null, {
        type: 'Json',
        set(value: any, model: Model, key: string, attributes) {
          return value ? JSON.stringify(value) : null;
        },
        get(value: any, model: Model, key: string, attributes) {
          return value ? JSON.parse(String(value)) : null;
        },
      }),
        
      // or
      meta: this.json(),
    };
  }
}
```

> The `json` method has been provided for defining Json Scalar fields.

It's actual attribute value will always be a string. However, you can treat the attribute as an object.

```javascript
const user = new User({
    name: "John Doe",
    meta: JSON.stringify({ key1: 1, key2: 2 }),
});

let meta = user.meta // returns an object
meta.key1 // returns 1
meta.key2 // returns 2

user.$getOriginal("meta") // returns a string

user.meta = { key3: 3 };
let meta = user.meta // returns an object
meta.key1 // returns undefined
meta.key3 // returns 3
user.$getAttribute("meta") // returns an object
```

> Note that the `meta` value used to instantiate the User model above is a string.



The provided field attributes allow providing an accessor as the only option.

```javascript
class User extends Model {
  static fields() {
    return {
      ...
      email: this.string(),
      has_email: this.boolean(false, (value, model) => value || !!model.email},
    };
  }
}
```



### Getting & Setting Attributes

Dobby provides methods `$getAttributes`, `$getAttribute`, `$setAttribute` for safely interacting with retrieved model attributes.

To get all attributes use the `$getAttributes` method;

```javascript
const attributes = user.$getAttributes();
```

This returns the `RAW` version of all original and changed attributes.

To get an attribute, use the `$getAttribute` methods;

```javascript
const name = user.$getAttribute('name');
const verified = user.$getAttribute('verified', false);
```

This returns the value of the attribute including changes made by accessors.

Of course, setting the attribute is done using the `$setAttribute` method.

```javascript
user.$setAttribute('name', 'John');
user.$setAttribute('verified', true); // discarded as verified is not a defined field
```

This also applies any changes made by the field mutators.

All defined fields are automatically directly accessible as object properties.

```javascript
const name = user.name; 
user.name = 'John'
user.verified = true // throws an error
```



### Filling Attributes

Model instances can be mass filled by attribute values. 

```javascript
const user = new User();
user.$fill({
    name: 'John Doe',
    email: 'john@mail.com',
    meta: {
        key1: 1,
    },
    verified: true, // discarded
})
```

Using `$fill`, Json field receives an Object rather than a raw string.