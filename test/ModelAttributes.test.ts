import { expect } from "chai";
import { Model } from "../src";

class User extends Model {
  static fields() {
    return {
      id: this.id(),
      name: this.string(),
      meta: this.json(),
    };
  }
}

describe("Model Attribute", () => {
  it("should save json fields", () => {
    const user = new User({
      name: "John Doe",
      meta: JSON.stringify({ key1: 1, key2: 2 }),
    });

    expect(user.$getOriginal("meta")).to.be.a("string");
    expect(user.meta).to.be.an("object");
    expect(user.meta.key1).to.equal(1);
    expect(user.meta.key2).to.equal(2);

    user.meta = { key3: 3 };
    expect(user.$getOriginal("meta")).to.be.a("string");
    expect(user.$getAttribute("meta")).to.be.an("object");
    expect(user.meta).to.be.an("object");
    expect(user.meta.key3).to.equal(3);
    expect(user.$getAttribute("meta").key3).to.equal(3);
  });
});
