import { expect } from "chai";
import { resolveType } from "../src/utils";

describe("Model Utils", () => {
  it("should resolve primitive value types", () => {
    expect(resolveType(3)).to.be.equal("Int");
    expect(resolveType("john")).to.be.equal("String");
    expect(resolveType(true)).to.be.equal("Boolean");
    expect(resolveType({}, "userInput")).to.be.equal("UserInput");
  });
});
