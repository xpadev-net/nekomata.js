import { A_ANY } from "@/@types/ast";

import { parse, SyntaxError as PeggySyntaxError } from "./parser";

const parseScript = (content: string, name: string): A_ANY => {
  let script = content.slice(1);
  let firstError = undefined;
  while (true) {
    try {
      return parse(script, { grammarSource: name });
    } catch (e) {
      firstError ??= e;
      if (!(e instanceof PeggySyntaxError)) {
        throw e;
      }
      console.info(e.format([{ source: name, text: script }]));
      if (
        script.length < 1 ||
        script.slice(0, e.location.start.offset) === script
      )
        throw firstError;
      script = script.slice(0, e.location.start.offset);
    }
  }
};

export { parseScript };