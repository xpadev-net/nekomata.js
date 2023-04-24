import { Utils } from "@/@types/execute";
import { Addition, Subtraction } from "@/operators";
import { NotImplementedError } from "@/errors/NotImplementedError";

const processUpdateExpression = (script: A_UpdateExpression, scopes: T_scope[], { execute, assign }: Utils) => {
  const value = execute(script.argument, scopes);
  if (script.operator === "--") {
    const result = Subtraction(value, 1);
    assign(script.argument, result, scopes);
    if (script.prefix) {
      return result;
    } else {
      return value;
    }
  } else if (script.operator === "++") {
    const result = Addition(value, 1);
    assign(script.argument, result, scopes);
    if (script.prefix) {
      return result;
    } else {
      return value;
    }
  }
  throw new NotImplementedError("update expression", script, scopes);
};

export { processUpdateExpression };
