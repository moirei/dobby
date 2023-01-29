import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import * as fetch from "cross-fetch";
import { Client, QueryType } from "../src";
import { Post } from "./models";

chai.use(chaiAsPromised);

describe("Readonly Model", () => {
  class ReadonlyPost extends Post {
    static entity = "Post";
    static modelKey = "ReadonlyPost";

    public static readonly readonly: boolean = true;
  }

  const errorMessage = "[Dobby] Cannot mutate readonly model [ReadonlyPost]";

  before(() => {
    const apolloClient = new ApolloClient({
      link: new HttpLink({
        ...fetch,
        uri: "https://graphql-demo.mead.io",
      }),
      cache: new InMemoryCache(),
    });

    const client = new Client({
      graphQlClient: apolloClient,
    });

    client.register(ReadonlyPost);
  });

  it("should fetch data as usual", async () => {
    const posts = await ReadonlyPost.findMany();
    expect(posts[0]).to.be.instanceOf(ReadonlyPost);
  });

  it("expect Model::create to throw an exception", async () => {
    const fn = () => ReadonlyPost.create();
    expect(fn()).to.eventually.be.rejected.with(errorMessage);
  });

  it("expect Model::createMany to throw an exception", async () => {
    const fn = () => ReadonlyPost.createMany([]);
    expect(fn()).to.eventually.be.rejected.with(errorMessage);
  });

  it("expect Model::upsert to throw an exception", async () => {
    const fn = () => ReadonlyPost.upsert({}, {});
    expect(fn()).to.eventually.be.rejected.with(errorMessage);
  });

  it("expect Model::update to throw an exception", async () => {
    const fn = () => ReadonlyPost.update({}, {});
    expect(fn()).to.eventually.be.rejected.with(errorMessage);
  });

  it("expect Model::delete to throw an exception", async () => {
    const fn = () => ReadonlyPost.delete({});
    expect(fn()).to.eventually.be.rejected.with(errorMessage);
  });

  it("expect Query::mutate to throw an exception", async () => {
    const fn = () => ReadonlyPost.newQuery().mutate("create");
    expect(fn()).to.eventually.be.rejected.with(errorMessage);
  });

  it("expect Query::mutation to throw an exception", async () => {
    const fn = () => ReadonlyPost.newQuery().mutation();
    expect(fn).to.be.throw(errorMessage);
  });

  it("expect Query::type with QueryType.MUTATION to throw an exception", async () => {
    const fn = () => ReadonlyPost.newQuery().type(QueryType.MUTATION);
    expect(fn).to.be.throw(errorMessage);
  });
});
