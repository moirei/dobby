# Customising Models

You can customise your models in various ways to better suite your use case. The example below allows performing a specific action on existing posts.


```javascript
class Post extends Model {
  get isPublished() {
    return this.$getAttribute("published_at") !== null;
  }

  /**
   * Publish the post.
   */
  public async $markAsPublic() {
    if(this.$exists()){
      const publishedAt = await this.$newQuery()
        .select("published_at")
        .where('where', {
          type: 'PostWhereUniqueInput',
          required: true,
          value: { id: this.id }
        })
        .parseWith((response) => response.data.markAsPublic.published_at)
        .mutate("markAsPublic");

      this.$setAttribute("published_at", publishedAt);
    }
  }
}
```



```javascript
const post = await Post.findUnqiue({ id: 1 })
await post.$markAsPublic()

if(post.isPublished){
   // 
}
```

This with execute the following query.

```graphql
mutation ($where: PostWhereUniqueInput!){
  markAsPublic(where: $where){
    published_at
  }
}
```