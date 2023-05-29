import { execute } from "@/core/coreContext";
import { PrototypeValueFunction } from "@/core/prototype/Value/index";

const processEquals: PrototypeValueFunction = (script, scopes, object) => {
  const value = execute(script.arguments[0], scopes);
  return object === value;
};

export { processEquals };