import { expect } from "chai";
import { Model } from "../src";

class User extends Model {
  static queryAttributes: string[] = ["id", "name"];

  static fields() {
    return {
      id: this.string(),
      name: this.string(),
      description: this.string(),
      posts: this.attr([], {
        type: Post,
      }).list(),
    };
  }
}
class Publisher extends Model {
  static fields() {
    return {
      id: this.string(),
      name: this.string(),
    };
  }
}
class Post extends Model {
  static queryAttributes: string[] = ["id", "name"];
  static queryRelationships: string[] = ["author"];

  static fields() {
    return {
      id: this.string(),
      name: this.string(),
      content: this.string(),
      author: this.attr(null, { type: User }),
      publisher: this.attr(null, { type: Publisher }),
    };
  }
}

describe("Stringify query", () => {
  it("should get query", () => {
    const query = User.where("id", 2)
      .select("id", "name")
      .include("posts", {
        where: { id: 5 },
        select: ["id", "content"],
        include: {
          author: ["id"],
        },
      });

    const output = query.operation("createOneUser").getQuery("userMutation");
    expect(output.query).to.be.a("string");
    expect(output.query.trim().replace(/\s/g, "")).to.have.string(
      "queryuserMutation($id:Int,$id1:Int){createOneUser(id:$id1){id,name,posts(id:$id){id,content,author{id}}}}"
    );
    expect(output.variables).to.have.keys(["id", "id1"]);
    expect(output.variables.id).to.equal(5);
    expect(output.variables.id1).to.equal(2);
  });

  it("should get query [2]", () => {
    const query = User.select("id", "name").include("posts", {
      where: {
        id: {
          type: "Int",
          required: true,
          value: 5,
        },
      },
      select: ["id", "content"],
      include: {
        author: ["id"],
      },
    });

    const output = query.operation("createOneUser").getQuery("userMutation");
    expect(output.query).to.be.a("string");
    expect(output.query.trim().replace(/\s/g, "")).to.have.string(
      "queryuserMutation($id:Int!){createOneUser{id,name,posts(id:$id){id,content,author{id}}}}"
    );
    expect(output.variables).to.have.keys(["id"]);
    expect(output.variables.id).to.equal(5);
  });
});
