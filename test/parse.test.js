import { parser } from "../lang.js";
import "mocha";
import { expect } from "chai";
function parse(prog) {
    const input = prog;
    const tree = parser.parse(input);
    const cursor = tree.cursor();
    let result = "";
    let hasError = false;
    do {
        //  console.log(cursor.node);
        result += cursor.node.type.name + ":";
        result += input.substring(cursor.node.from, cursor.node.to) + "\n";
        if (cursor.node.type.name === "⚠") {
            hasError = true;
        }
    } while (cursor.next());
    return [result, hasError];
}
describe("parsing", function () {
    it("should parse standalone identifiers", () => {
        expect(parse("x")[1]).to.equal(true);
    });
});
//# sourceMappingURL=parse.test.js.map