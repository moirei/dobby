import { expect } from "chai";
import { Dictionary } from "lodash";
import {
  Model,
  FieldBuilder,
  FieldAttribute,
  RelationshipAttribute,
} from "../src";
import { fakeUsers } from "./faker";

class PostFieldBuilder extends FieldBuilder {
  public datetime(name: string) {
    return this.attr(name, {
      type: "DateTime",
    });
  }
}

class UserModel extends Model {
  id?: string;
  email?: string;
  meta?: Dictionary<any>;
  posts?: PostModel[];

  static fields(f: FieldBuilder) {
    f.id();
    f.string("name");
    f.string("email");
    f.json("meta", { watch: true });
    f.model("posts", PostModel).list().default([]);
  }
}

class PostModel extends Model {
  id?: string;
  title?: string;
  created_at?: string;
  author?: UserModel;

  static fieldBuilder() {
    return PostFieldBuilder;
  }

  static fields(f: PostFieldBuilder) {
    f.id();
    f.string("title");
    f.datetime("created_at");
    f.model("author", UserModel);
  }
}

describe("FieldBuilder", () => {
  it("should create", () => {
    class TestUserModel extends UserModel {}
    const fieldBuilder = new FieldBuilder(TestUserModel);
    expect(fieldBuilder).to.be.instanceOf(FieldBuilder);
  });

  it("should create an attribute", () => {
    class TestUserModel extends UserModel {}
    const fieldBuilder = new FieldBuilder(TestUserModel);

    const attr_1 = fieldBuilder.attr("id");
    expect(attr_1).to.be.instanceOf(FieldAttribute);
    expect(attr_1.key).to.equal("id");
    expect(attr_1.type).to.equal(undefined);
    expect(attr_1.isRelationship).to.equal(false);

    const attr_2 = fieldBuilder.attr("name", {
      type: "String",
    });
    expect(attr_2.key).to.equal("name");
    expect(attr_2.type).to.equal("String");
    expect(attr_2.isList).to.equal(false);
    expect(attr_2.isReadonly).to.equal(false);

    const attr_3 = fieldBuilder.attr("published", {
      default: false,
      list: true,
      readonly: true,
    });
    expect(attr_3.type).to.equal("Boolean");
    expect(attr_3.isList).to.equal(true);
    expect(attr_3.isReadonly).to.equal(true);
  });

  it("should create a boolean attribute", () => {
    class TestUserModel extends UserModel {}
    const fieldBuilder = new FieldBuilder(TestUserModel);

    const attr_1 = fieldBuilder.boolean("published");
    expect(attr_1.key).to.equal("published");
    expect(attr_1.type).to.equal("Boolean");
    expect(attr_1.getDefault()).to.equal(undefined);

    const attr_2 = fieldBuilder.boolean("published", true);
    expect(attr_2.getDefault()).to.equal(true);
  });

  it("should create a float attribute", () => {
    class TestUserModel extends UserModel {}
    const fieldBuilder = new FieldBuilder(TestUserModel);

    const attr_1 = fieldBuilder.float("quantity");
    expect(attr_1.key).to.equal("quantity");
    expect(attr_1.type).to.equal("Float");
    expect(attr_1.getDefault()).to.equal(undefined);

    const attr_2 = fieldBuilder.float("quantity", 3);
    expect(attr_2.getDefault()).to.equal(3);
  });

  it("should create an ID attribute", () => {
    class TestUserModel extends UserModel {}
    const fieldBuilder = new FieldBuilder(TestUserModel);

    const attr_1 = fieldBuilder.id();
    expect(attr_1.key).to.equal("id");
    expect(attr_1.type).to.equal("ID");

    const attr_2 = fieldBuilder.id("handle", "Int");
    expect(attr_2.key).to.equal("handle");
    expect(attr_2.type).to.equal("Int");
  });

  it("should create an integer attribute", () => {
    class TestUserModel extends UserModel {}
    const fieldBuilder = new FieldBuilder(TestUserModel);

    const attr_1 = fieldBuilder.integer("quantity");
    expect(attr_1.key).to.equal("quantity");
    expect(attr_1.type).to.equal("Int");
    expect(attr_1.getDefault()).to.equal(undefined);

    const attr_2 = fieldBuilder.integer("quantity", 3);
    expect(attr_2.getDefault()).to.equal(3);
  });

  it("should create a JSON attribute", () => {
    class TestUserModel extends UserModel {}
    const fieldBuilder = new FieldBuilder(TestUserModel);

    const attr_1 = fieldBuilder.json("meta");
    expect(attr_1.key).to.equal("meta");
    expect(attr_1.type).to.equal("Json");

    const attr_2 = fieldBuilder.json("meta", "JSON");
    expect(attr_2.type).to.equal("JSON");
  });

  it("should create relationships", () => {
    class TestUserModel extends UserModel {}
    class TestPostModel extends PostModel {}
    const fieldBuilder = new FieldBuilder(TestUserModel);
    expect(fieldBuilder.model("post1", TestPostModel)).to.be.instanceOf(
      RelationshipAttribute
    );
    expect(fieldBuilder.relation("posts1", TestPostModel)).to.be.instanceOf(
      RelationshipAttribute
    );
  });

  it("should create a relationship attribute", () => {
    class TestUserModel extends UserModel {}
    class TestPostModel extends PostModel {}
    const fieldBuilder = new FieldBuilder(TestUserModel);

    const attr_1 = fieldBuilder.relation("post1", TestPostModel);
    expect(attr_1.key).to.equal("post1");
    expect(attr_1.type).to.equal("TestPostModel");
    expect(attr_1.isList).to.equal(false);
    expect(attr_1.isRelationship).to.equal(true);
    expect(attr_1.getDefault()).to.equal(undefined);

    const attr_2 = fieldBuilder.relation("post2", TestPostModel, {
      list: true,
      default: 1,
    });
    expect(attr_2.isList).to.equal(true);
    expect(attr_2.getDefault()).to.equal(1);

    const attr_3 = fieldBuilder.relation("post2", TestPostModel).list();
    expect(attr_3.isList).to.equal(true);
  });

  it("should create list attribute with proxy", () => {
    class TestUserModel extends UserModel {}
    const fieldBuilder = new FieldBuilder(TestUserModel);
    const proxy = fieldBuilder.list;
    // expect(proxy).to.be.instanceOf(Proxy);
    const attr = proxy.string("name");
    expect(attr).to.be.instanceOf(FieldAttribute);
    expect(attr.isList).to.equal(true);
  });
});

describe("Model Attributes", () => {
  it("should define model attributes", () => {
    const user = new UserModel();
    const fields = user.$attributeFields();
    const relationships = user.$relationshipFields();

    expect(fields).to.haveOwnProperty("id");
    expect(fields).to.haveOwnProperty("name");
    expect(relationships).to.haveOwnProperty("posts");
    expect(relationships.posts).to.haveOwnProperty("type");
    expect(relationships.posts.type).to.equal("PostModel");
    expect(relationships.posts.isList).to.equal(true);
    // expect(fields.id).to.be.instanceOf(FieldAttribute);
    // expect(relationships.posts).to.be.instanceOf(RelationshipAttribute);
  });

  it("should define model attributeFields [with custom field builder]", () => {
    const post = new PostModel();
    const fields = post.$attributeFields();
    const relationships = post.$relationshipFields();

    expect(fields).to.haveOwnProperty("id");
    expect(fields).to.haveOwnProperty("title");
    expect(fields).to.haveOwnProperty("created_at");
    expect(relationships).to.haveOwnProperty("author");

    expect(fields.id).to.be.instanceOf(FieldAttribute);
    expect(fields.created_at).to.be.instanceOf(FieldAttribute);
    expect(relationships.author).to.be.instanceOf(RelationshipAttribute);
    expect(relationships.author.isList).to.equal(false);
  });

  it("should save json fields", () => {
    const user = new UserModel({
      name: "John Doe",
      meta: JSON.stringify({ key1: 1, key2: 2 }),
    });

    expect(user.$getOriginal("meta")).to.be.a("string");
    expect(user.meta).to.be.an("object");
    expect(user.meta?.key1).to.equal(1);
    expect(user.meta?.key2).to.equal(2);

    user.meta = { key3: 3 };
    expect(user.$getOriginal("meta")).to.be.a("string");
    expect(user.$getAttribute("meta")).to.be.an("object");
    expect(user.meta).to.be.an("object");
    expect(user.meta.key3).to.equal(3);
    expect(user.$getAttribute("meta").key3).to.equal(3);
  });

  it("should save json sub-fields", () => {
    const user = new UserModel({
      name: "John Doe",
      meta: JSON.stringify({ key1: 1, key2: 2 }),
    });

    user.meta = { key3: 3 };
    const meta = user.meta || {};
    meta.key4 = 4;

    expect(user.$getOriginal("meta")).to.be.a("string");
    expect(user.$getAttribute("meta")).to.be.an("object");
    expect(user.meta).to.be.an("object");
    expect(user.meta?.key1).to.equal(1);
    expect(user.meta?.key2).to.equal(2);
    expect(user.meta?.key3).to.equal(3);
    expect(user.meta?.key4).to.equal(4);
  });
});
