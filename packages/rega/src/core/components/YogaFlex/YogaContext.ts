import { createContext } from "react";
import { Node } from "yoga-layout";

interface YogaContext {
  node: Node;
  drive: () => void;
  layoutCallbacks: Set<() => void>;
}

export default createContext<YogaContext>(null as any);
