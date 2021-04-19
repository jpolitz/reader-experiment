import * as parser from "./lang.js";
import {start} from "repl";
import {TreeCursor} from "lezer";


const keepGrouping = ["Brackets", "Parens", "Braces", "KwBlock"];

function toSexp(prog : string, cursor : TreeCursor) {
  const name = cursor.node.type.name;
  var result : any = [name];
  var hasNext = cursor.firstChild();
  if(!hasNext) {
    result.push(prog.substring(cursor.from, cursor.to));
    return result;
  }
  let length = 0;
  while(hasNext) {
    length += 1;
    result.push(toSexp(prog, cursor));
    hasNext = cursor.nextSibling();
  }
  cursor.parent();
  if(length === 1 && (keepGrouping.indexOf(name) === -1)) { return result[1]; }
  return result;
}


function myEval(cmd : string, context : any, filename : string, callback : any) {
  const input = cmd;
  const tree = parser.parser.configure({strict: true}).parse(input);
  const cursor = tree.cursor();

  console.log(JSON.stringify(toSexp(cmd, cursor), null));
  callback(null, "");
}


start({prompt: ">>> ", eval: myEval});