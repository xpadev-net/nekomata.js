import { Utils } from "@/@types/execute";
import { resolve } from "@/utils/utils";
import typeGuard from "@/typeGuard";

const processIdentifier = (script: A_Identifier, scopes: T_scope[], { execute }: Utils): unknown => {
  const value = resolve(script, scopes);
  if (typeGuard.definedFunction(value)) {
    if (value.isKari) {
      return execute(value.script.arguments[1], [{}, ...scopes]);
    } else {
      return execute(value.script.arguments[1], [{}, ...scopes]);
    }
  }
  return value;
};

export { processIdentifier };