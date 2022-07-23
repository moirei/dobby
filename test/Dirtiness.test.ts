import { faker } from "@faker-js/faker";
import { expect } from "chai";
import { Dictionary } from "lodash";
import { Model, FieldBuilder } from "../src";
import { fakeComments, fakeUsers } from "./faker";
import { Post, User } from "./models";

describe("Attribute fields", () => {
  it("expects model be dirty when attribute updated", () => {
    const user = new User({
      name: "John",
      email: faker.internet.email(),
    });

    expect(user.$isDirty()).to.be.false;
    expect(user.$isDirty("name")).to.be.false;
    user.name = "John Doe";
    expect(user.$isDirty()).to.be.true;
    expect(user.$isDirty("name")).to.be.true;
  });

  it("expects model be dirty when filled", () => {
    const user = new User({
      name: "John",
      email: faker.internet.email(),
    });

    expect(user.$isDirty()).to.be.false;

    user.$fill({
      name: "John Doe",
    });

    expect(user.$isDirty()).to.be.true;
  });

  it("expects filled field to be dirty", () => {
    const user = new User({
      name: "John",
      email: faker.internet.email(),
    });

    expect(user.$isDirty("name")).to.be.false;
    expect(user.$isDirty("email")).to.be.false;

    user.$fill({
      name: "John Doe",
    });

    expect(user.$isDirty("name")).to.be.true;
    expect(user.$isDirty("email")).to.be.false;
  });

  it("expects array updates of the same value to not be dirty", () => {
    const post = new Post({
      id: faker.datatype.uuid(),
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
      tags: ["t1"],
    });

    expect(post.$isDirty()).to.be.false;
    expect(post.$isDirty("tags")).to.be.false;

    post.tags = ["t1"];

    expect(post.$isDirty()).to.be.false;
    expect(post.$isDirty("tags")).to.be.false;
  });

  it("expects array updates to be dirty", () => {
    const post = new Post({
      id: faker.datatype.uuid(),
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
      tags: ["t1", "t2"],
    });

    expect(post.$isDirty()).to.be.false;
    expect(post.$isDirty("tags")).to.be.false;

    post.tags = ["t1"];

    expect(post.$isDirty()).to.be.true;
    expect(post.$isDirty("tags")).to.be.true;
  });
});

describe("Relationship fields", () => {
  it("expects updated relationships should be dirty", () => {
    const post = new Post({
      id: faker.datatype.uuid(),
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
    });
    const [author] = fakeUsers();

    expect(post.$isDirty()).to.be.false;
    expect(post.author).to.be.undefined;

    post.author = author;

    expect(post.$isDirty()).to.be.true;
    expect(post.author).to.be.instanceOf(User);
    // expect(post.$isDirty()).to.be.true;
  });

  it("expects array updates of the same (empty) value to not be dirty", () => {
    const post = new Post({
      id: faker.datatype.uuid(),
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
      comments: [],
    });

    expect(post.$isDirty()).to.be.false;
    expect(post.$isDirty("comments")).to.be.false;

    post.comments = [];

    expect(post.$isDirty()).to.be.false;
    expect(post.$isDirty("comments")).to.be.false;
  });

  it("expects array updates of the same value to not be dirty", () => {
    const [comment] = fakeComments();
    const post = new Post({
      id: faker.datatype.uuid(),
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
      comments: [comment],
    });

    expect(post.$isDirty()).to.be.false;
    expect(post.$isDirty("comments")).to.be.false;

    post.comments = [comment];

    expect(post.$isDirty()).to.be.false;
    expect(post.$isDirty("comments")).to.be.false;
  });

  it("expects array updates of the different value of same length to be dirty", () => {
    const post = new Post({
      id: faker.datatype.uuid(),
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
      comments: fakeComments(),
    });

    expect(post.$isDirty()).to.be.false;
    expect(post.$isDirty("comments")).to.be.false;

    post.comments = fakeComments();

    expect(post.$isDirty()).to.be.true;
    expect(post.$isDirty("comments")).to.be.true;
  });

  it("expects updated relationship to be deep dirty", () => {
    const [comment] = fakeComments();
    const post = new Post({
      id: faker.datatype.uuid(),
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
      comments: [comment],
    });

    expect(post.$isDirty()).to.be.false;
    expect(post.$isDirty("comments")).to.be.false;
    expect(post.$isDeepDirty()).to.be.false;
    expect(post.$isDeepDirty("comments")).to.be.false;

    comment.text = "updated text";

    expect(post.$isDirty()).to.be.false;
    expect(post.$isDirty("comments")).to.be.false;
    expect(post.$isDeepDirty()).to.be.true;
    expect(post.$isDeepDirty("comments")).to.be.true;
  });

  it("expects updated nested relationships should be dirty", () => {
    const [author] = fakeUsers();
    const post = new Post({
      id: faker.datatype.uuid(),
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
      author,
    });

    author.name = "Updated name";

    expect(author.$isDirty()).to.be.true;
    expect(post.$isDirty()).to.be.false;
    expect(post.$isDeepDirty()).to.be.true;
  });

  it("expects keeping changes to updated relationships to clear dirty", () => {
    const post = new Post({
      id: faker.datatype.uuid(),
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
    });
    const [author] = fakeUsers();

    post.author = author;

    expect(post.$isDirty()).to.be.true;
    expect(post.author).to.be.instanceOf(User);
    post.$keepChanges();
    expect(post.$isDirty()).to.be.false;
  });

  it("should keep changes to updated nested relationships", () => {
    const [author] = fakeUsers();
    const post = new Post({
      id: faker.datatype.uuid(),
      title: faker.lorem.text(),
      body: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
      author,
    });

    author.name = "Updated name";

    expect(post.$isDeepDirty()).to.be.true;
    post.$keepChanges();
    expect(post.$isDeepDirty()).to.be.false;
  });
});

describe("JSON fields", () => {
  class UserModel extends Model {
    id?: string;
    email?: string;
    meta?: Dictionary<any>;

    static fields(f: FieldBuilder) {
      f.id();
      f.string("name");
      f.string("email");
      f.json("meta", { watch: true });
    }
  }

  it("should be dirty when json sub-fields changed", async () => {
    const user = new UserModel({
      name: "John Doe",
      meta: JSON.stringify({ key1: 1, key2: 2 }),
    });

    expect(user.$isDirty()).to.equal(false);
    if (user.meta) user.meta.key1 = 2;
    expect(user.$isDirty()).to.equal(true);
    if (user.meta) user.meta.key1 = 1;
    expect(user.$isDirty()).to.equal(false);
  });
});
