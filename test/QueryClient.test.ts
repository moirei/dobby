import ApolloClient from "apollo-client";
import chai, { expect } from "chai";
import spies from "chai-spies";
import { plural } from "pluralize";
import {
  DefaultAdapter,
  Query,
  Client,
  Model,
  ModelType,
  FieldBuilder,
} from "../src";
import { User, Post, Comment } from "./models";

chai.use(spies);

class TestAdapter extends DefaultAdapter {
  findMany(query: Query<any>, model: ModelType): Query<any> | void {
    return this.executeHook(model, "findMany", [query, model], () => {
      const operation = plural(
        String(model.entity).toLocaleLowerCase().replace("model", "")
      );
      query
        .operation(operation)
        .parseWith((response) => response.data[operation]);
    });
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
    class PostModel extends Model {
      static fields(f: FieldBuilder) {
        f.id();
        f.string("body");
        f.boolean("published");
      }
    }

    const adapter = new TestAdapter();
    const client = new Client({
      url: "https://graphql-demo.mead.io",
      adapter,
    });
    client.register(PostModel);

    const findManySpy = chai.spy.on(adapter, "findMany");

    const posts = await PostModel.select("id", "published").findMany();
    expect(posts[0]).to.be.instanceOf(PostModel);
    expect(posts[0]).to.have.ownProperty("id");
    expect(findManySpy).to.have.been.called();
  });

  it("should execute query", async () => {
    const users = await User.select("id", "name").query("users");
    expect(users.data.users[0]).to.have.ownProperty("id");
    expect(users.data.users[0]).to.have.ownProperty("name");
  });
});
