import * as parser from "./lang.js";
import {start} from "repl";

function myEval(cmd : string, context : any, filename : string, callback : any) {
  const input = cmd;
  const tree = parser.parser.parse(input);
  const cursor = tree.cursor();
  let result = "";
  let hasError = false;

  do {
    //  console.log(cursor.node);
    result += cursor.node.type.name + ":";
    result += input.substring(cursor.node.from, cursor.node.to) + "\n";
    if(cursor.node.type.name === "⚠") {
      hasError = true;
    }
  } while (cursor.next());
  console.log(result);
  if(hasError) {
    callback(null, "Error");
    return;
  }
  callback(null, "Success");
}


start({prompt: ">>> ", eval: myEval});