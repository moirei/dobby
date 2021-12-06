import { expect } from "chai";
import { Model } from "../src";

class User extends Model {
  static fields() {
    return {
      id: this.id(),
      name: this.string(),
      email: this.string(),
      posts: this.model(Post).list(),
    };
  }
}
class Post extends Model {
  static fields() {
    return {
      id: this.id(),
      title: this.string(),
    };
  }
}

describe("Model fields", () => {
  it("should create instance", () => {
    const user = new User();
    expect(user).to.be.instanceOf(User);
    expect(user).to.not.be.instanceOf(Post);
    expect(User.make()).to.be.instanceOf(User);
  });

  it("should differentiate attributes and relationships", () => {
    expect(User.fieldAttributes).to.be.eql(["id", "name", "email"]);
    expect(User.fieldRelationships).to.be.eql(["posts"]);
  });

  it("should get and set fields", () => {
    const user = new User({
      id: 3,
      name: "John Doe",
      email: "johndoe@mail.com",
    });

    expect(user.$getAttribute("id")).to.be.equal(3);
    // @ts-ignore
    expect(user.name).to.equal("John Doe");
    expect(user.$getAttribute("name")).to.equal("John Doe");
    expect(user.$getAttribute("description", 5)).to.be.equal(5);
    // @ts-ignore
    expect(user.id).to.be.equal(3);

    // @ts-ignore
    user.name = "John Sno";
    // @ts-ignore
    expect(user.name).to.equal("John Sno");
    expect(user.$getAttribute("name")).to.equal("John Sno");

    // @ts-ignore
    user.$setAttribute("name", "John Carter");
    // @ts-ignore
    expect(user.name).to.equal("John Carter");
    expect(user.$getAttribute("name")).to.equal("John Carter");

    expect(user.$getOriginal("name")).to.equal("John Doe");
  });

  it("should throw when attempting to set readonly field", () => {
    const user = new User();
    // @ts-ignore
    expect(() => (user.id = 5)).to.throw();
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
