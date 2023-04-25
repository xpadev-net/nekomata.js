import { Utils } from "@/@types/execute";

const processVariableDeclaration = (script: A_VariableDeclaration, scopes: T_scope[], { execute, getName }: Utils) => {
  for (const item of script.declarations) {
    if (item.init === null) {
      return execute(
        {
          type: "CallExpression",
          callee: item.id,
          arguments: [],
        } as A_CallExpression,
        scopes,
      );
    } else {
      if (scopes[0]) {
        scopes[0][getName(item.id, scopes) as string] = execute(item.init, scopes);
      }
    }
  }
};
export { processVariableDeclaration };