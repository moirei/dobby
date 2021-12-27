import { expect } from "chai";
import { Dictionary } from "lodash";
import {
  Model,
  FieldAttribute,
  RelationshipAttribute,
  boolean,
  string,
  float,
  id,
  integer,
  json,
  model,
} from "../src";

describe("Decorator [Boolean]", () => {
  class User extends Model {
    static get modelKey() {
      return "UserModelWithDecorator [1]";
    }

    @boolean()
    // @ts-ignore
    fieldA!: boolean;

    @boolean(false)
    // @ts-ignore
    fieldB!: boolean;

    @boolean()
    // @ts-ignore
    fieldC!: boolean = true;

    @boolean()
    // @ts-ignore
    fieldD!: boolean[] = [];

    @boolean({ default: [] })
    // @ts-ignore
    fieldE!: boolean[];
  }

  it("should inject boolean fields", () => {
    const fields = User.getFields();
    expect(fields).to.haveOwnProperty("fieldA");
    expect(fields).to.haveOwnProperty("fieldB");
    expect(fields).to.haveOwnProperty("fieldC");
    expect(fields.fieldA.type).to.equal("Boolean");
    expect(fields.fieldA).to.instanceOf(FieldAttribute);
    expect(fields.fieldB).to.instanceOf(FieldAttribute);
    expect(fields.fieldC).to.instanceOf(FieldAttribute);
    expect(fields.fieldD).to.instanceOf(FieldAttribute);
    expect(fields.fieldD.isList).to.equal(true);
  });

  it("should inject boolean fields with defaults", () => {
    const user = new User();
    expect(user.fieldA).to.eql(undefined);
    expect(user.fieldB).to.eql(false);
    expect(user.fieldC).to.eql(true);
    expect(user.fieldD).to.eql([]);
    expect(user.fieldE).to.eql([]);
  });
});

describe("Decorator [String]", () => {
  class User extends Model {
    static get modelKey() {
      return "UserModelWithDecorator [2]";
    }

    @string()
    // @ts-ignore
    fieldA!: string;

    @string("Hello world")
    // @ts-ignore
    fieldB!: string;

    @string()
    // @ts-ignore
    fieldC!: string = "Hello world!";

    @string()
    // @ts-ignore
    fieldD!: string[] = [];

    @string({ default: [] })
    // @ts-ignore
    fieldE!: string[];
  }

  it("should inject string fields", () => {
    const fields = User.getFields();
    expect(fields).to.haveOwnProperty("fieldA");
    expect(fields).to.haveOwnProperty("fieldB");
    expect(fields).to.haveOwnProperty("fieldC");
    expect(fields.fieldA.type).to.equal("String");
    expect(fields.fieldA).to.instanceOf(FieldAttribute);
    expect(fields.fieldB).to.instanceOf(FieldAttribute);
    expect(fields.fieldC).to.instanceOf(FieldAttribute);
    expect(fields.fieldD).to.instanceOf(FieldAttribute);
    expect(fields.fieldD.isList).to.equal(true);
  });

  it("should inject string fields with defaults", () => {
    const user = new User();
    expect(user.fieldA).to.eql(undefined);
    expect(user.fieldB).to.eql("Hello world");
    expect(user.fieldC).to.eql("Hello world!");
    expect(user.fieldD).to.eql([]);
    expect(user.fieldE).to.eql([]);
  });
});

describe("Decorator [Float]", () => {
  class User extends Model {
    static get modelKey() {
      return "UserModelWithDecorator [3]";
    }

    @float()
    // @ts-ignore
    fieldA!: number;

    @float(3)
    // @ts-ignore
    fieldB!: number;

    @float()
    // @ts-ignore
    fieldC!: number = 4;

    @float()
    // @ts-ignore
    fieldD!: number[] = [];

    @float({ default: [5] })
    // @ts-ignore
    fieldE: number[];
  }

  it("should inject float fields", () => {
    const fields = User.getFields();
    expect(fields).to.haveOwnProperty("fieldA");
    expect(fields.fieldA.type).to.equal("Float");
    expect(fields.fieldD.isList).to.equal(true);
  });

  it("should inject float fields with defaults", () => {
    const user = new User();
    expect(user.fieldA).to.eql(undefined);
    expect(user.fieldB).to.eql(3);
    expect(user.fieldC).to.eql(4);
    expect(user.fieldD).to.eql([]);
    expect(user.fieldE).to.eql([5]);
  });
});

describe("Decorator [ID]", () => {
  class User extends Model {
    static get modelKey() {
      return "UserModelWithDecorator [4]";
    }

    @id()
    // @ts-ignore
    fieldA!: string;

    @id("id")
    // @ts-ignore
    fieldB!: string;
  }

  it("should inject ID fields", () => {
    const fields = User.getFields();
    expect(fields).to.haveOwnProperty("fieldA");
    expect(fields.fieldA.type).to.equal("ID");
    expect(fields.fieldB.type).to.equal("id");
  });
});

describe("Decorator [Integer]", () => {
  class User extends Model {
    static get modelKey() {
      return "UserModelWithDecorator [5]";
    }

    @integer()
    // @ts-ignore
    fieldA!: number;

    @integer(3)
    // @ts-ignore
    fieldB!: number;

    @integer()
    // @ts-ignore
    fieldC!: number = 4;

    @integer()
    // @ts-ignore
    fieldD!: number[] = [];

    @integer({ default: [5] })
    // @ts-ignore
    fieldE: number[];
  }

  it("should inject integer fields", () => {
    const fields = User.getFields();
    expect(fields).to.haveOwnProperty("fieldA");
    expect(fields.fieldA.type).to.equal("Int");
    expect(fields.fieldD.isList).to.equal(true);
  });

  it("should inject integer fields with defaults", () => {
    const user = new User();
    expect(user.fieldA).to.eql(undefined);
    expect(user.fieldB).to.eql(3);
    expect(user.fieldC).to.eql(4);
    expect(user.fieldD).to.eql([]);
    expect(user.fieldE).to.eql([5]);
  });
});

describe("Decorator [JSON]", () => {
  class User extends Model {
    static get modelKey() {
      return "UserModelWithDecorator [6]";
    }

    @json()
    // @ts-ignore
    fieldA!: Dictionary<any>;

    @json("JSON")
    // @ts-ignore
    fieldB!: Dictionary<any>;

    @json()
    // @ts-ignore
    fieldC!: Dictionary<any> = { key: "value" };
  }

  it("should inject JSON fields", () => {
    const fields = User.getFields();
    expect(fields).to.haveOwnProperty("fieldA");
    expect(fields.fieldA.type).to.equal("Json");
    expect(fields.fieldB.type).to.equal("JSON");
  });

  it("should inject JSON fields should have default value", () => {
    const user = new User();
    expect(user.fieldC).to.haveOwnProperty("key");
    expect(user.fieldC.key).to.equal("value");
  });
});

describe("Decorator [Model]", () => {
  class Post extends Model {
    static get modelKey() {
      return "PostModelWithDecorator [7]";
    }

    @string()
    // @ts-ignore
    title: string;
  }

  class User extends Model {
    static get modelKey() {
      return "UserModelWithDecorator [7]";
    }

    @model(Post)
    // @ts-ignore
    fieldA!: Post;

    @model(Post, { default: new Post() })
    // @ts-ignore
    fieldB!: Post;

    @model(Post)
    // @ts-ignore
    fieldC!: Post = new Post({ title: "User post" });

    @model(Post)
    // @ts-ignore
    fieldD!: Post[] = [];

    @model(Post, { default: [] })
    // @ts-ignore
    fieldE!: Post[];
  }

  it("should inject Model relationship fields", () => {
    const fields = User.getFields();
    expect(fields).to.haveOwnProperty("fieldA");
    expect(fields).to.haveOwnProperty("fieldB");
    expect(fields).to.haveOwnProperty("fieldC");
    expect(fields.fieldB.type).to.equal("Post");
    expect(fields.fieldB).to.instanceOf(RelationshipAttribute);
    expect(fields.fieldC).to.instanceOf(RelationshipAttribute);
    expect(fields.fieldD).to.instanceOf(RelationshipAttribute);
    expect(fields.fieldD.isList).to.equal(true);
  });

  it("should inject Model relationship fields with defaults", () => {
    const user = new User();
    expect(user.fieldA).to.eql(undefined);
    expect(user.fieldB).to.instanceOf(Post);
    expect(user.fieldB.title).to.eql(undefined);
    expect(user.fieldC).to.instanceOf(Post);
    expect(user.fieldC.title).to.eql("User post");
    expect(user.fieldD).to.eql([]);
    expect(user.fieldE).to.eql([]);
  });
});
