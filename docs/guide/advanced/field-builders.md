# Field Builders

You can easily extend the available build methods used for defining model fields.

The example below adds `timestamps` method which can be used to define an attribute as a `Moment` object.


```javascript
import { FieldBuilder as BaseFieldBuilder, FieldAttribute } from '@moirei/dobby'
import moment, { Moment } from 'moment'

export default class FieldBuilder extends BaseFieldBuilder {
  /**
   * Create a datetime (moment) attribute.
   *
   * @param {string} name
   * @param {string} format
   * @returns {FieldAttribute}
   */
  public datetime(name: string, format = 'YYYY-MM-DD h:mm:ss') {
    return this.attr(name, {
      type: 'DateTime',
      // convert to Moment if set
      get(v) {
        if (typeof v === 'string') {
          return moment(v, format)
        }
        return v
      },
      // convert back to string if set
      set(v) {
        return v && typeof v !== 'string' ? v.format(format) : v
      },
    })
  }

  public timestamps() {
    this.datetime('created_at').readonly()
    this.datetime('updated_at').readonly()
  }

  public node() {
    this.id()
    this.timestamps()
  }
}
```

Now a model can use the new field methods.
```javascript
class User extends Model{
  id!: string;
  created_at!: Moment;
  updated_at?: Moment;
  name!: string;
  email!: string;
  last_active?: Moment;

  static fieldBuilder() {
    return FieldBuilder;
  }

  static fields(f: FieldBuilder) {
    f.node();
    f.string("name");
    f.string("email");
    f.datetime("last_active");
  }
}

```

Ideally, you might to extend the base model with your app's defaults.

```javascript
abstract class BaseModel extends Model{
  static maxQueryDepth: number = 4;

  static fieldBuilder() {
    return FieldBuilder;
  }
}

...

class User extends BaseModel{
  ...

  static fields(f: FieldBuilder) {
    f.node();
    f.string("name");
    ...
  }
}

```

