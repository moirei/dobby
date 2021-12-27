import { expect } from "chai";
import { User, Post } from "./models";

describe("Model fields", () => {
  it("should create instance", () => {
    const user = new User();
    expect(user).to.be.instanceOf(User);
    expect(user).to.not.be.instanceOf(Post);
    expect(User.make()).to.be.instanceOf(User);
  });

  it("should differentiate attributes and relationships", () => {
    expect(User.fieldAttributes).to.include("id");
    expect(User.fieldAttributes).to.include("name");
    expect(User.fieldAttributes).to.include("email");
    expect(User.fieldRelationships).to.include("posts");
    expect(User.fieldRelationships).to.include("comments");
  });

  it("should get and set fields", () => {
    const user = new User({
      id: 3,
      name: "John Doe",
      email: "johndoe@mail.com",
    });

    expect(user.$getAttribute("id")).to.be.equal(3);
    expect(user.name).to.equal("John Doe");
    expect(user.$getAttribute("name")).to.equal("John Doe");
    expect(user.$getAttribute("description", 5)).to.be.equal(5);
    expect(user.id).to.be.equal(3);

    user.name = "John Sno";
    expect(user.name).to.equal("John Sno");
    expect(user.$getAttribute("name")).to.equal("John Sno");

    user.$setAttribute("name", "John Carter");
    expect(user.name).to.equal("John Carter");
    expect(user.$getAttribute("name")).to.equal("John Carter");

    expect(user.$getOriginal("name")).to.equal("John Doe");
  });

  it("should throw when attempting to set readonly field", () => {
    const user = new User();
    expect(() => (user.id = "5")).to.throw();
  });

  it("should fill attribute fields", () => {
    const user = new User();

    user.$fill({
      name: "John Doe",
      email: "johndoe@mail.com",
    });

    // @ts-ignore
    expect(user.name).to.equal("John Doe");
    expect(user.$getAttribute("name")).to.equal("John Doe");
    expect(user.$getOriginal("name")).to.equal(undefined);
    expect(user.$isDirty("name")).to.be.true;
  });

  it("should fill relationship fields", () => {
    const user = new User({
      name: "John Doe",
      email: "johndoe@mail.com",
      posts: [
        {
          title: "My first post",
        },
        new Post({
          title: "My second post",
        }),
      ],
    });

    expect(user.posts).to.have.lengthOf(2);
    expect(user.posts[0]).to.be.instanceOf(Post);
    expect(user.posts[1]).to.be.instanceOf(Post);
    expect(user.posts[0].$getAttribute("title")).to.equal("My first post");
    expect(user.posts[1].$getAttribute("title")).to.equal("My second post");
  });

  it("updated attributes should be dirty", () => {
    const user = new User({
      name: "John",
    });

    expect(user.$isDirty("name")).to.be.false;
    // @ts-ignore
    user.name = "Doe";
    expect(user.$isDirty()).to.be.true;
  });

  it("should convert to json", () => {
    const user = new User({
      name: "John Doe",
      email: "johndoe@mail.com",
      posts: [
        {
          title: "My first post",
        },
        new Post({
          title: "My second post",
        }),
      ],
    });

    expect(user).to.haveOwnProperty("name");
    expect(user).to.haveOwnProperty("email");
    expect(user).to.haveOwnProperty("posts");
    expect(user.posts).to.have.lengthOf(2);
    expect(user.posts[0]).to.haveOwnProperty("title");
  });

  it("should compare models", () => {
    expect(new User().$is(new User())).to.be.true;
    expect(new User().$is(new Post())).to.be.false;
    expect(new User({ id: 1 }).$is(new User({ id: 1 }))).to.be.true;
    expect(new User({ id: 1 }).$is(new User({ id: 2 }))).to.be.false;
    expect(new User({ id: 1 }).$is(new Post({ id: 1 }))).to.be.false;
  });
});
