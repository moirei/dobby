import { faker } from "@faker-js/faker";
import chai, { expect } from "chai";
import spies from "chai-spies";
import { Relationships } from "../src";
import { Collection } from "../src/Collection";
import { fakePosts, fakeUsers } from "./faker";
import { Post, User } from "./models";
import {
  resolveType,
  isChanged,
  isRelationshipsChanged,
  extractArrayRelationshipChanges,
  willMutateLifecycleHook,
} from "../src/utils";

chai.use(spies);

describe("Model Utils", () => {
  it("should resolve primitive value types", () => {
    expect(resolveType(3)).to.be.equal("Int");
    expect(resolveType("john")).to.be.equal("String");
    expect(resolveType(true)).to.be.equal("Boolean");
    expect(resolveType({}, "userInput")).to.be.equal("UserInput");
  });
});

describe("#isChanged", () => {
  it("expects objects with array attr to be changed", () => {
    const a = {
      id: "1",
      tags: ["A", "B"],
    };
    const b = {
      id: "2",
    };
    const c = {
      tags: ["A"],
    };
    const d = {
      tags: ["A", "B", "C"],
    };

    expect(isChanged(a, b)).to.equal(true);
    expect(isChanged(a, c)).to.equal(true);
    expect(isChanged(a, d)).to.equal(true);
  });
});

describe("#isRelationshipsChanged", () => {
  it("should compare relationships", () => {
    const [modelA] = fakeUsers();
    const models = Collection.from(fakeUsers(2));
    const a: Relationships = {
      fieldA: modelA,
      fieldB: models,
    };
    const b: Relationships = {
      fieldA: modelA,
      fieldB: models,
    };

    expect(isRelationshipsChanged(a, b)).to.be.false;
  });

  it("expects reverted change to not be considered changed", () => {
    const [modelA, modelB] = fakeUsers(2);
    const models = Collection.from(fakeUsers(2));
    const a: Relationships = {
      fieldA: modelA,
      fieldB: models,
    };
    const b: Relationships = {
      fieldA: modelA,
      fieldB: models,
    };

    expect(isRelationshipsChanged(a, b)).to.be.false;
    b.fieldB = modelB;
    expect(isRelationshipsChanged(a, b)).to.be.true;
    b.fieldB = models;
    expect(isRelationshipsChanged(a, b)).to.be.false;
  });
});

describe("#extractArrayRelationshipChanges", () => {
  it("should extract items to be created", () => {
    const user = new User({
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      posts: fakePosts(3),
    });

    const post = new Post({
      // without ID
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
    });

    user.posts.push(post);

    const { create } = extractArrayRelationshipChanges(user, "posts");

    expect(create).to.have.lengthOf(1);
    expect(create[0]).to.be.instanceOf(Post);
    expect(create[0]).to.equal(post);
    expect(create[0].$is(post)).to.be.true;
  });

  it("should extract items to be updated", () => {
    const [post, ...posts] = fakePosts(3);
    const user = new User({
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      posts: [post, ...posts],
    });

    post.title = "Updated title";

    const { update } = extractArrayRelationshipChanges(user, "posts");

    expect(update).to.have.lengthOf(1);
    expect(update[0]).to.be.instanceOf(Post);
    expect(update[0]).to.equal(post);
    expect(update[0].$is(post)).to.be.true;
  });

  it("should extract items to be deleted", () => {
    const [post, ...posts] = fakePosts(3);
    const user = new User({
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      posts: [...posts, post],
    });

    user.posts.pop();

    const { deleting } = extractArrayRelationshipChanges(user, "posts");

    expect(deleting).to.have.lengthOf(1);
    expect(deleting[0]).to.be.instanceOf(Post);
    expect(deleting[0]).to.equal(post);
    expect(deleting[0].$is(post)).to.be.true;
  });

  it("should not have any extractions", () => {
    const user = new User({
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      posts: fakePosts(3),
    });

    const { create, update, deleting } = extractArrayRelationshipChanges(
      user,
      "posts"
    );

    expect(create).to.be.empty;
    expect(update).to.be.empty;
    expect(deleting).to.be.empty;
  });
});

describe("#willMutateLifecycleHook", () => {
  it("willMutateLifecycleHook should return false if hook returns false", () => {
    const name = "$creating";
    const args: any = [1, 2];
    const modelType: any = { getHook: () => null };

    const hook = () => false;
    const getHookSpy = chai.spy.on(modelType, "getHook", () => hook);

    const directive = willMutateLifecycleHook(modelType, name, args);

    expect(getHookSpy).to.have.been.called.with(name);
    expect(directive).to.be.false;
  });

  it("willMutateLifecycleHook should return directive if truthy", () => {
    const name = "$creating";
    const args: any = [1, 2];
    const modelType: any = { getHook: () => null };

    const data = faker.datatype.json();

    const hook = () => data;
    const getHookSpy = chai.spy.on(modelType, "getHook", () => hook);

    const directive = willMutateLifecycleHook(modelType, name, args);

    expect(getHookSpy).to.have.been.called.with(name);
    expect(directive).to.equal(data);
  });

  it("willMutateLifecycleHook should return arg #1 by default", () => {
    const name = "$creating";
    const args: any = [1, 2];
    const modelType: any = { getHook: () => null };

    const hook = () => {
      //
    };
    const getHookSpy = chai.spy.on(modelType, "getHook", () => hook);

    const directive = willMutateLifecycleHook(modelType, name, args);

    expect(getHookSpy).to.have.been.called.with(name);
    expect(directive).to.equal(args[1]);
  });

  it("willMutateLifecycleHook should return empty object if arg #2 is falsy", () => {
    const name = "$creating";
    const args: any = [1, null];
    const modelType: any = { getHook: () => null };

    const hook = () => {
      //
    };
    const getHookSpy = chai.spy.on(modelType, "getHook", () => hook);

    const directive = willMutateLifecycleHook(modelType, name, args);

    expect(getHookSpy).to.have.been.called.with(name);
    expect(typeof directive == "object").to.be.true;
    expect(directive).to.empty;
  });
});
