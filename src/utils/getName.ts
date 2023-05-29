import { A_ANY, T_scope } from "@/@types/ast";
import { setGetName } from "@/context";
import typeGuard from "@/typeGuard";
import {execute} from "@/core/coreContext";

/**
 * 変数名を取得する関数
 * @param target
 * @param scopes
 */
const getName = (target: A_ANY, scopes: T_scope[]) => {
  if (typeGuard.Identifier(target)) {
    return target.name;
  } else {
    return execute(target, scopes);
  }
};

const initGetName = () => {
  setGetName(getName);
};

export { initGetName };
