import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useConst from "../../hooks/useConst";
import { findTransition, TransitionItem } from "./Transition";

export interface LeafNode {
  children: null;
  active: boolean;
}

export interface StateNode {
  children: Record<string, StateNode | LeafNode>;
  transition: TransitionItem[];
}

function noop() {}

const AnimationTreeContext = React.createContext<{
  node: StateNode;
  onAnimationFrame: (value: any) => void;
  drive: () => void;
  switchTo: (state: string[]) => void;
  path: string[];
}>(null as any);

export { AnimationTreeContext };

interface AnimationNode {
  name?: string;
}

interface AnimationTreeProps<T> extends AnimationNode {
  state?: string[];
  children: ReactElement<AnimationNode> | ReactElement<AnimationNode>[];
  onAnimationFrame?: (value: T) => void;
  renderItem?: (value: T) => React.ReactNode;
}

export function isLeafNode(n: StateNode | LeafNode): n is LeafNode {
  return !n.children;
}

function findLeafNode(n: StateNode, path: string[]): LeafNode | null {
  if (path.length === 0) {
    return null;
  }

  let node = n;
  for (let i = 0; i < path.length; i++) {
    node = node.children[path[i]] as StateNode;
    if (!node) {
      return null;
    }
    if (isLeafNode(node)) {
      return node as LeafNode;
    }
  }
  return null;
}

export default function AnimationTree<T>({
  name = "",
  state: _state = [],
  children,
  onAnimationFrame: _onAnimationFrame,
  renderItem,
}: AnimationTreeProps<T>) {
  const parentCtx = useContext(AnimationTreeContext);
  const isRoot = !parentCtx;

  const [value, setValue] = useState<T>();

  const node = useMemo<StateNode>(
    () => ({
      children: {},
      transition: [],
    }),
    []
  );

  const s = useConst({
    lastState: _state,
    state: _state,
    n: {} as LeafNode,
  });

  useEffect(() => {
    s.state = _state;
    checkAndSwitch();
  }, [_state.join(",")]);

  function switchTo(state: string[]) {
    const n = findLeafNode(node, state);
    if (n) {
      s.n.active = false;
      n.active = true;
      s.n = n;
      s.lastState = state;
    }
  }

  function checkAndSwitch() {
    // root
    if (isRoot) {
      const n = findLeafNode(node, s.state) || {
        children: null,
        active: false,
      };

      if (n) {
        s.n.active = false;
        const tansition = findTransition(node, s.lastState, s.state);
        if (tansition) {
          tansition.target = s.state;
          switchTo(tansition.trans);
        } else {
          n.active = true;
          s.n = n;
          s.lastState = s.state;
        }
      }
    }
  }

  function onAnimationFrame(value: T) {
    _onAnimationFrame?.(value);
    if (renderItem) {
      setValue(value);
    }
  }

  const ctx = useMemo(
    () => ({
      node,
      onAnimationFrame: isRoot
        ? onAnimationFrame || noop
        : parentCtx.onAnimationFrame,
      drive: isRoot ? checkAndSwitch : parentCtx.drive,
      path: isRoot ? [] : parentCtx.path.concat(name),
      switchTo: isRoot ? switchTo : parentCtx.switchTo,
    }),
    []
  );

  useEffect(() => {
    // child
    if (!isRoot && name) {
      parentCtx.node.children[name] = ctx.node;
    }
  }, []);

  if (!isRoot && !name) {
    return null;
  }

  return (
    <>
      <AnimationTreeContext.Provider value={ctx}>
        {children}
      </AnimationTreeContext.Provider>
      {typeof value !== undefined && !!renderItem && renderItem(value!)}
    </>
  );
}
