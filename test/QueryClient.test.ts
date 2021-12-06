import ApolloClient from "apollo-client";
import chai, { expect } from "chai";
import spies from "chai-spies";
import { plural } from "pluralize";
import {
  Adapter,
  DefaultAdapter,
  Query,
  Client,
  Model,
  ModelType,
} from "../src";

chai.use(spies);

class TestAdapter extends DefaultAdapter {
  findMany(query: Query, model: ModelType): Query | void {
    return this.executeHook(model, "findMany", [query, model], () => {
      const operation = plural(model.name).toLocaleLowerCase();
      query
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
  }
}

const findManyHook: Adapter["findMany"] = (query, model) => {
  const operation = plural(model.name).toLocaleLowerCase();
  query.operation(operation).parseWith((response) => response.data[operation]);
};

class User extends Model {
  static queryAttributes: string[] = ["id", "name"];

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
  static queryAttributes: string[] = ["id", "name"];
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
  static queryRelationships: string[] = ["author"];

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

client.register(User);
client.register(Post);
client.register(Comment);

describe("Client Instance", () => {
  it("should have default adapter and apollo client", () => {
    const client = new Client();
    expect(client.adapter).to.be.instanceOf(DefaultAdapter);
    expect(client.apollo).to.be.instanceOf(ApolloClient);
  });

  it("should register models", () => {
    expect(client.models).to.have.keys(["User", "Post", "Comment"]);
  });

  it("should have client in registered models", () => {
    expect(User.client).to.be.instanceOf(Client);
    expect(User.client).to.equal(client);
    expect(User.client?.adapter).to.be.instanceOf(DefaultAdapter);
  });
});

describe("Client CRUD", () => {
  it("should fetch simple query", async () => {
    const users = await User.select("id", "name").operation("users").get();
    expect(users.data.users[0]).to.have.ownProperty("id");
    expect(users.data.users[0]).to.have.ownProperty("name");
  });

  it("should fetch query with findMany", async () => {
    const users = await User.select("id", "name").findMany();
    expect(users[0]).to.have.ownProperty("id");
    expect(users[0]).to.have.ownProperty("name");
  });

  it("should fetch query with findMany and include comments", async () => {
    const users = await User.select("id", "name")
      .include("comments")
      .findMany();
    expect(users[0]).to.have.ownProperty("id");
    expect(users[0]).to.have.ownProperty("name");
    expect(users[0]).to.have.ownProperty("comments");
    expect(users[0].comments[0]).to.be.instanceOf(Comment);
    expect(users[0].comments[0]).to.have.ownProperty("id");
    expect(users[0].comments[0]).to.have.ownProperty("text");
  });

  it("should call default hook", async () => {
    const findManySpy = chai.spy(Post.hooks().findMany);
    // const findManySpy = chai.spy.on(Post.hooks(), "findMany");
    const posts = await Post.select("id").findMany();
    expect(posts[0]).to.have.ownProperty("id");
    // expect(findManySpy).to.have.been.called();
    // expect(findManyHook).to.have.been.called();
  });
});

describe("Client Custom Adapter", () => {
  it("should use provided adapter", async () => {
    class Post extends Model {
      static fields() {
        return {
          id: this.string(),
          body: this.string(),
          published: this.boolean(),
        };
      }
    }

    const adapter = new TestAdapter();
    const client = new Client({
      url: "https://graphql-demo.mead.io",
      adapter,
    });
    client.register(Post);

    const posts = await Post.select("id", "published")
      .with("author")
      .findMany();
    expect(posts[0]).to.be.instanceOf(Post);
    expect(posts[0]).to.have.ownProperty("id");
    // expect(adapter.findMany).to.have.been.called();
  });

  it("should execute query", async () => {
    const users = await User.select("id", "name").query("users");
    expect(users.data.users[0]).to.have.ownProperty("id");
    expect(users.data.users[0]).to.have.ownProperty("name");
  });
});
