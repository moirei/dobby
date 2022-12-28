# Readonly Models

In some cases, you might want your models to be readonly and disallow mutations. For example you might want to provide the dynamic query mechanism in your storefront SDK without any API endpoints for mutations. In this case it's possible to make a model `readonly`.

```typescript
class PublishedProduct extends Product {
  static entity = "Product";
  static modelKey = "PublishedProduct";

  public static readonly readonly: boolean = true;

  // or

  public static get readonly(): boolean {
    return true;
  }
}
```

Query as usual

```typescript
const products = await PublishedProduct.select(["id", "name"])
  .include("reviews")
  .findMany();
```

All mutation operations on this Product model, directly or via its queries, will throw an exception.
