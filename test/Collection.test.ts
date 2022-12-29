import { expect } from "chai";
import { Collection } from "../src/Collection";
import { fakeComments, fakeUsers } from "./faker";
import { Post, User } from "./models";

describe("Collection", () => {
  let collection: Collection;

  it("should create collection", () => {
    collection = new Collection([new User()]);

    expect(collection).to.be.instanceOf(Collection);
    expect(collection.length).to.equal(1);
  });

  it("should map collection and keep instance", () => {
    collection = new Collection([new User()]);
    const mapped = collection.map((item) => item);

    expect(mapped instanceof Collection).to.be.true;
    expect(mapped).to.be.instanceOf(Collection);
    expect(mapped.length).to.equal(1);
  });

  it("should create collection using [from]", () => {
    collection = Collection.from([new User(), new Post()]);

    expect(collection).to.be.instanceOf(Collection);
    expect(collection.length).to.equal(2);
  });

  it("expects collection to be array", () => {
    collection = Collection.from([new User()]);

    expect(Array.isArray(collection)).to.be.true;
  });
});

describe("Collection Dirtiness", () => {
  let collection: Collection;

  it("should not be dirty before change", () => {
    collection = Collection.from(fakeUsers());

    expect(collection.$isDirty()).to.be.false;
  });

  it("should be dirty after change", () => {
    const [userA, userB] = fakeUsers(2);
    collection = Collection.from([userA]);
    collection.push(new User(userB));

    expect(collection.$isDirty()).to.be.true;
  });

  it("should NOT be dirty after change reverted", () => {
    const [userA, userB, userC] = fakeUsers(3);
    collection = Collection.from([userA, userB, userC]);

    const popped = collection.pop();

    expect(collection.$isDirty()).to.be.true;
    expect(popped).to.equal(userC);
    collection.push(userC);
    expect(collection.$isDirty()).to.be.false;
  });

  it("should be dirty when model modified", () => {
    const [userA, ...users] = fakeUsers(3);
    collection = Collection.from([userA, ...users]);

    expect(collection.$isDirty()).to.be.false;
    userA.name = "New name";
    expect(collection.$isDirty()).to.be.true;
  });

  it("should be dirty when model child modified", () => {
    const [userA, ...users] = fakeUsers(3);

    const [comment] = fakeComments();
    userA.$attach("comments", [comment]);
    collection = Collection.from([userA, ...users]);

    expect(collection.$isDirty()).to.be.false;

    comment.text = "Updated comment text";

    expect(userA.$isDirty()).to.be.false;
    expect(userA.$isDeepDirty()).to.be.true;

    expect(collection.$isDirty()).to.be.false;
    expect(collection.$isDeepDirty()).to.be.true;
  });

  it("should be dirty when model childred has a new child", () => {
    const [user] = fakeUsers();

    const [commentA, commentB] = fakeComments(2);
    user.$attach("comments", [commentA]);

    expect(user.$isDeepDirty()).to.be.false;

    user.comments.push(commentB);

    expect(user.$isDeepDirty()).to.be.true;

    user.$keepChanges();

    expect(user.$isDeepDirty()).to.be.false;
  });

  it("should NOT be dirty after changes kept", () => {
    const [userA, ...users] = fakeUsers(3);

    const [comment] = fakeComments();
    userA.$attach("comments", [comment]);
    collection = Collection.from([userA, ...users]);

    expect(collection.$isDirty()).to.be.false;

    comment.text = "Updated comment text";

    expect(collection.$isDirty()).to.be.false;
    expect(collection.$isDeepDirty()).to.be.true;

    comment.$keepChanges();

    expect(collection.$isDeepDirty()).to.be.false;
    expect(userA.$isDeepDirty()).to.be.false;
  });
});
