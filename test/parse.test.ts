import {parser} from "../lang.js";
import "mocha";
import { expect } from "chai";
import { TreeCursor } from "lezer";

const LOG = true;

function toSexp(prog : string, cursor : TreeCursor) {
  switch(cursor.type.name) {
    case '⚠':
      return "ERROR";
    case '':
      var result : any = [];
      var hasNext = cursor.firstChild();
      while(hasNext) {
        result.push(toSexp(prog, cursor));
        hasNext = cursor.nextSibling();
      }
      cursor.parent();
      return result;
    default:
      var result : any = [cursor.node.type.name];
      var hasNext = cursor.firstChild();
      while(hasNext) {
        result.push(toSexp(prog, cursor));
        hasNext = cursor.nextSibling();
      }
      cursor.parent();
      return result;
  }
}

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
  function t(s : string, n : string) {
    expect(parse(s)[1]).to.equal(true, n + "\n" + s);
  }
  function f(s : string, n : string) {
    expect(parse(s)[1]).to.equal(false, n + "\n" + s);
  }
  it("should parse a bunch of programs", () => {
    t("x", "standalone identifier");
    t("x()", "no args call");
    t(`
x()
y(10, 11)
`, "multiple calls");

    t(`
fun len(l):
  cases(List):
    | empty => 0
    | link(f, r) => 1 + len(r)
  end
end
`, "len")

    t(`
    [list: 1, 2, 3]
`, "list")

  });

  it("works with data pretty much unchanged", () => {
    t(`
data List[A]:
  | link(f :: A, r :: List[A])
  | empty
end
`, "I'm using [] for type instantiation, but I tihnk <> could also work");
  });

  it("requires changes to tables", () => {
    f(`
table(x, y, z):
  | 1, 2, 3
  | 4, 5, 6
end
`, "This form of table doesn't work yet because we can't support unbracketed sequences here. This might be doable, but has lots of gnarly conflict potential.");

    f(`
table: x, y, z
  row: 1, 2, 3
  row: 4, 5, 6
end
`, "This form of table probably won't ever work because nested “keywords” is a really tricky case to handle in parsing.");

    t(`
table(x, y, z):
  [ 1, 2, 3 ]
  [ 4, 5, 6 ]
end
`, "This works, and could be square brackets or other kinds of delimeters");

  });



  it("requires changes to reactor", () => {
    t(`
reactor:
  | init => 5
  | on-tick => update-state
  | to-draw => draw-state
end
`, "This form parses. The piped list has to be used because it is a keyword block, as opposed to a delimited list");

    t(`
{reactor:
  init => 5,
  on-tick => update-state,
  to-draw => draw-state
  }
`, "This form parses. The comma list can be used because it is a brace block with a name");

    t(`
reactor:
  | init => 5
  | on-tick(state) => state + 1
  | to-draw(state) => circle(50, "solid", "red")
end
`, "This form parses. Since the sides of the => pair are both skel, there aren't key restrictions");
  });

});