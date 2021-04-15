import {parser} from "../lang.js";
import "mocha";
import { expect } from "chai";

function parse(prog : string) : [string, boolean] {
  const input = prog;
  const tree = parser.parse(input);
  const cursor = tree.cursor();
  let result = "";
  let success = true;

  do {
    //  console.log(cursor.node);
    result += cursor.node.type.name + ":";
    result += input.substring(cursor.node.from, cursor.node.to) + "\n";
    if(cursor.node.type.name === "⚠") {
      success = false;
    }
  } while (cursor.next());
  return [result, success];
}

describe("parsing", function() {
  it("should parse standalone identifiers", () => {
    expect(parse("x")[1]).to.equal(true);
  });
});