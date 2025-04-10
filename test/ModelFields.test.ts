import { expect } from "chai";
import { FieldBuilder, Model } from "../src";
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

    expect(user.name).to.equal("John Doe");
    expect(user.$getAttribute("name")).to.equal("John Doe");
    expect(user.$getOriginal("name")).to.equal(undefined);
    expect(user.$isDirty("name")).to.be.true;
  });

  it("should cast attribute fields", () => {
    class User extends Model {
      static get modelKey() {
        return "castAttributeFieldsUserModel";
      }

      id!: string;
      name!: string;
      visits!: number;
      visitsList!: number[];
      tags!: string[];
      active!: boolean;

      static fields(f: FieldBuilder) {
        f.id();
        f.string("name");
        f.integer("visits");
        f.boolean("active");
        f.integer("visitsList").list();
        f.string("tags").list();
      }
    }

    const user = new User();

    // @ts-ignore
    user.name = 2;
    // @ts-ignore
    user.active = "1";
    // @ts-ignore
    user.visits = "34";
    // @ts-ignore
    user.visitsList = [3, "4", 45];
    // @ts-ignore
    user.tags = [3, "4", 45];

    // @ts-ignore
    expect(user.name).to.eql("2");
    expect(user.active).to.eql(true);
    expect(user.visits).to.eql(34);
    expect(user.visitsList).to.eql([3, 4, 45]);
    expect(user.tags).to.eql(["3", "4", "45"]);
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

describe("Model.$fillDeep", () => {
  it("should deeply fill attributes and relationships", () => {
    const user = new User();

    user.$fillDeep({
      name: "Alice",
      email: "alice@example.com",
      posts: [{ title: "Post A" }, new Post({ title: "Post B" })],
    });

    expect(user.name).to.equal("Alice");
    expect(user.email).to.equal("alice@example.com");
    expect(user.posts).to.have.lengthOf(2);
    expect(user.posts[0]).to.be.instanceOf(Post);
    expect(user.posts[1]).to.be.instanceOf(Post);
    expect(user.posts[0].title).to.equal("Post A");
    expect(user.posts[1].title).to.equal("Post B");
  });

  it("should update existing nested models", () => {
    const user = new User({
      posts: [new Post({ title: "Old Title" })],
    });

    user.$fillDeep({
      posts: [{ title: "Updated Title" }],
    });

    expect(user.posts[0].title).to.equal("Updated Title");
  });

  it.skip("should not overwrite attributes with undefined", () => {
    const user = new User({
      name: "Initial",
      posts: [new Post({ title: "Keep me" })],
    });

    user.$fillDeep({
      posts: undefined,
    });

    const fn = () => {
      user.$fillDeep({
        posts: undefined,
      });
    };

    expect(fn).to.throw();
    expect(user.posts).to.have.lengthOf(1);
  });

  it("should attach relationship if not yet present", () => {
    const user = new User();

    user.$fillDeep({
      posts: [{ title: "First Post" }],
    });

    expect(user.posts).to.have.lengthOf(1);
    expect(user.posts[0].title).to.equal("First Post");
  });

  it("should work with nested model instances directly", () => {
    const post = new Post({ title: "From Instance" });
    const user = new User();

    user.$fillDeep({ posts: [post] });

    expect(user.posts[0]).to.equal(post);
  });
});
