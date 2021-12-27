import { expect } from "chai";
import { User } from "./models";

describe("Stringify query", () => {
  it("should get query", () => {
    const query = User.where("id", 2)
      .select("id", "name")
      .include("posts", {
        where: { id: 5 },
        select: ["id", "body"],
        include: {
          author: ["id"],
        },
      });

    const output = query.operation("createOneUser").getQuery("userMutation");
    expect(output.query).to.be.a("string");
    expect(output.query.trim().replace(/\s/g, "")).to.have.string(
      "queryuserMutation($id:Int,$id1:Int){createOneUser(id:$id1){id,name,posts(id:$id){id,body,author{id}}}}"
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
      select: ["id", "body"],
      include: {
        author: ["id"],
      },
    });

    const output = query.operation("createOneUser").getQuery("userMutation");
    expect(output.query).to.be.a("string");
    expect(output.query.trim().replace(/\s/g, "")).to.have.string(
      "queryuserMutation($id:Int!){createOneUser{id,name,posts(id:$id){id,body,author{id}}}}"
    );
    expect(output.variables).to.have.keys(["id"]);
    expect(output.variables.id).to.equal(5);
  });
});
