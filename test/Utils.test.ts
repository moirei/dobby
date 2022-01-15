import { expect } from "chai";
import { isEqual, isObject } from "lodash";
import { resolveType, isChanged, changes } from "../src/utils";

describe("Model Utils", () => {
  it("should resolve primitive value types", () => {
    expect(resolveType(3)).to.be.equal("Int");
    expect(resolveType("john")).to.be.equal("String");
    expect(resolveType(true)).to.be.equal("Boolean");
    expect(resolveType({}, "userInput")).to.be.equal("UserInput");
  });
});

describe("isChanged Utils", () => {
  it("expects objects with array attr to be changed", () => {
    const a = {
      id: "1",
      tags: ["A", "B"],
    };
    const b = {
      id: "2",
    };
    const c = {
      tags: ["A"],
    };
    const d = {
      tags: ["A", "B", "C"],
    };

    expect(isChanged(a, b)).to.equal(true);
    expect(isChanged(a, c)).to.equal(true);
    expect(isChanged(a, d)).to.equal(true);
  });
});
