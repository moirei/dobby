import { expect } from "chai";
import { Attribute, ModelAttribute, BooleanAttribute, Model } from "../src";

class Post extends Model {
  static fields() {
    return {
      id: this.id(),
      name: this.string(),
    };
  }
}

class User extends Model {
  static fields() {
    return {
      id: this.id(),
      name: this.string(),
      recentPost: this.model(Post),
      posts: this.attr(null, {
        type: Post,
      }).list(),
    };
  }
}

describe("BooleanAttribute Attribute", () => {
  it("should make BooleanAttribute attribute with default", () => {
    const attribute = BooleanAttribute.make(true);
    expect(attribute).to.be.instanceOf(BooleanAttribute);
    expect(attribute.getDefault()).to.equal(true);
  });

  it("should invalidate non-BooleanAttribute values", () => {
    expect(BooleanAttribute.make().validate(1)).to.equal(false);
  });
});

describe("Model attributes", () => {
  it("should contain applied fields", () => {
    const fields = new User().$fields();
    expect(fields).to.haveOwnProperty("id");
    expect(fields).to.haveOwnProperty("recentPost");
    expect(fields).to.haveOwnProperty("posts");
    expect(fields.recentPost).to.be.instanceOf(Attribute);
    expect(fields.recentPost).to.be.instanceOf(ModelAttribute);
    expect(fields.posts).to.be.instanceOf(Attribute);
    expect(fields.posts).to.not.be.instanceOf(ModelAttribute);
    expect(fields.posts).to.haveOwnProperty("name");
    expect(fields.posts.name).to.equal("Post");
  });
});
