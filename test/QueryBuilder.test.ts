import { expect } from "chai";
import { Query, Client, Model } from "../src";

class User extends Model {
  static queryAttributes: string[] = ["id", "name"];

  static fields() {
    return {
      id: this.string(),
      name: this.string(),
      description: this.string(),
      posts: this.attr([], {
        type: Post,
      }).list(),
    };
  }
}
class Publisher extends Model {
  static fields() {
    return {
      id: this.string(),
      name: this.string(),
    };
  }
}
class Post extends Model {
  static queryAttributes: string[] = ["id", "name"];
  static queryRelationships: string[] = ["author"];

  static fields() {
    return {
      id: this.string(),
      name: this.string(),
      content: this.string(),
      author: this.attr(null, { type: User }),
      publisher: this.attr(null, { type: Publisher }),
    };
  }
}

describe("Create Query instance", () => {
  it("should create instance", () => {
    expect(new Query(User)).to.be.instanceOf(Query);
    expect(Query.make(User)).to.be.instanceOf(Query);
    expect(Query.make(User).getModelType()).to.be.equal(User);
    const $entity = Query.make(User).getModelType() as typeof User;
    expect(new $entity()).to.be.instanceOf(User);
  });

  it("should create query from model", () => {
    expect(User.newQuery()).to.be.instanceOf(Query);
    expect(User.newQuery().getModelType()).to.be.equal(User);
    const $entity = User.newQuery().getModelType() as typeof User;
    expect(new $entity()).to.be.instanceOf(User);
  });
});

describe("Query Wheres", () => {
  it("should have arguments [approach 1]", () => {
    const query = User.where("num_1", 5)
      .where("num_2", 3.2)
      .where("bool_1", true);
    const args = query.getArguments();
    expect(args).to.have.keys(["num_1", "num_2", "bool_1"]);
    expect(args.num_1.type).to.equal("Int");
    expect(args.num_2.type).to.equal("Float");
    expect(args.bool_1.type).to.equal("Boolean");
  });

  it("should have arguments [approach 2]", () => {
    const query = User.where({
      num_1: 5,
      num_2: 3.2,
      bool_1: true,
    });
    const args = query.getArguments();
    expect(args).to.have.keys(["num_1", "num_2", "bool_1"]);
    expect(args.num_1.type).to.equal("Int");
    expect(args.num_2.type).to.equal("Float");
    expect(args.bool_1.type).to.equal("Boolean");
  });
});

describe("Query Selects", () => {
  it("should select provided fields", () => {
    const query = User.select("id", "name");
    expect(query.getSelects()).to.be.eql(["id", "name"]);
  });

  it("should select default model fields", () => {
    const query = User.newQuery();
    expect(query.getSelects()).to.be.eql(["id", "name"]);
  });

  it("should add fields to selection", () => {
    const query = Post.select("id").add("content");
    expect(query.getSelects()).to.be.eql(["id", "content"]);
  });

  it("should select all model fields", () => {
    const query = User.select("*");
    expect(query.getSelects()).to.be.eql(["id", "name", "description"]);
  });

  it("should only select model fields", () => {
    expect(User.select(["id", "name", "other"]).getSelects()).to.be.eql([
      "id",
      "name",
    ]);
  });
});

describe("Query Includes", () => {
  it("should include provided relationships", () => {
    const query = User.include("posts");
    expect(query.getRelationships()).to.have.key("posts");
    expect(query.getRelationships().posts).to.be.instanceOf(Query);
  });

  it("should include eager loaded relationships", () => {
    const query = Post.newQuery();
    expect(query.getRelationships()).to.have.key("author");
    expect(query.getRelationships().author).to.be.instanceOf(Query);
  });

  it("should select all model relationships", () => {
    expect(Post.include("*").getRelationships()).to.have.all.keys([
      "author",
      "publisher",
    ]);
    expect(Post.include(["*"]).getRelationships()).to.have.all.keys([
      "author",
      "publisher",
    ]);
    expect(Post.include("publisher").getRelationships()).to.have.all.keys([
      "author",
      "publisher",
    ]);
  });

  it("should include relationship and select provided fields", () => {
    const query = User.include("posts", {
      select: ["id"],
    });
    const postsQuery = query.getRelationships()["posts"] as Query;
    expect(postsQuery).to.be.instanceOf(Query);
    expect(postsQuery.getSelects()).to.eql(["id"]);
    expect(postsQuery.getRelationships()).to.have.key("author");
  });

  it("should include relationship and select provided fields", () => {
    const query = User.include("posts", {
      select: ["id"],
      include: {
        publisher: {
          select: ["id", "name"],
        },
      },
    });
    const postsQuery = query.getRelationships()["posts"] as Query;
    expect(postsQuery).to.be.instanceOf(Query);
    expect(postsQuery.getSelects()).to.eql(["id"]);
    expect(postsQuery.getRelationships()).to.have.keys(["author", "publisher"]);
    const publisherQuery = postsQuery.getRelationships()["publisher"] as Query;
    expect(publisherQuery.getSelects()).to.eql(["id", "name"]);
  });

  it("should include relationship and select provided fields using callback", () => {
    const query = User.include("posts", function (query) {
      query.select("id").include("publisher", ["id", "name"]);
    });
    const postsQuery = query.getRelationships()["posts"] as Query;
    expect(postsQuery).to.be.instanceOf(Query);
    expect(postsQuery.getSelects()).to.eql(["id"]);
    expect(postsQuery.getRelationships()).to.have.keys(["author", "publisher"]);
    const publisherQuery = postsQuery.getRelationships()["publisher"] as Query;
    expect(publisherQuery.getSelects()).to.eql(["id", "name"]);
  });

  it("should include relationship and select all fields", () => {
    const query_1 = User.include("posts", {
      select: ["id", "name"],
    });

    const postsQuery_1 = query_1.getRelationships()["posts"] as Query;
    expect(postsQuery_1.getSelects()).to.eql(["id", "name"]);

    const query_2 = User.include("posts", {
      where: {
        id: 1,
        where: {
          type: "PostWhereUniqueInput",
          required: true,
          value: {
            id: 2,
          },
        },
      },
      select: {
        id: true,
        content: true,
      },
      include: {
        publisher: true,
      },
    });

    const postsQuery_2 = query_2.getRelationships()["posts"] as Query;
    expect(postsQuery_2.getSelects()).to.eql(["id", "content"]);

    const queryArgs = postsQuery_2.getArguments();
    expect(queryArgs).to.have.keys(["id", "where"]);
    expect(queryArgs.id.type).to.equal("Int");
    expect(queryArgs.where.type).to.equal("PostWhereUniqueInput");
    expect(queryArgs.where.required).to.be.true;
    expect(queryArgs.where.value).to.eql({ id: 2 });

    expect(postsQuery_2.getRelationships()).to.have.keys([
      "author",
      "publisher",
    ]);
    const publisherQuery = postsQuery_2.getRelationships()[
      "publisher"
    ] as Query;
    expect(publisherQuery.getSelects()).to.eql(["id", "name"]);
  });

  it("should mentain nested queries", () => {
    const query = User.where("id", 2)
      .select("id", "name")
      .include("posts", {
        where: { id: 5, slug: "post-slug" },
        select: ["id", "content"],
        include: {
          author: ["id"],
        },
      });

    expect(query.getSelects()).to.eql(["id", "name"]);
    expect(Object.keys(query.getArguments())).to.eql(["id"]);

    const postsQuery = query.getRelationships().posts as Query;
    expect(postsQuery).to.be.instanceOf(Query);
    expect(postsQuery.getSelects()).to.eql(["id", "content"]);
    expect(Object.keys(postsQuery.getArguments())).to.eql(["id", "slug"]);

    const authorQuery = postsQuery.getRelationships().author as Query;
    expect(authorQuery).to.be.instanceOf(Query);
    expect(authorQuery.getSelects()).to.eql(["id"]);
  });
});

describe("Query Proxy", () => {
  class User extends Model {
    static dynamicQueryOperations: boolean = true;

    static fields() {
      return {
        id: this.id(),
        name: this.string(),
      };
    }
  }

  const client = new Client({
    url: "https://graphql-demo.mead.io",
  });
  client.register(User);

  it("should have dynamic queries enabled", async () => {
    // @ts-ignore
    const users = await User.newQuery().select("id").users();
    expect(users.data.users[0]).to.have.ownProperty("id");
  });
});
