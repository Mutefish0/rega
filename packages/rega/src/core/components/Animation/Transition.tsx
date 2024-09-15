import React, { ReactElement, useContext, useMemo, useEffect } from "react";
import { AnimationTreeContext, StateNode, isLeafNode } from "./AnimationTree";

export interface TransitionItem {
  // static
  from: string[];
  // static
  to: string[];
  // static tansition animation
  trans: string[];

  // dynamic
  target: string[];
}

interface Transitionable {
  name?: string;
  onAnimationEnd?: () => void;
  onDeactive?: () => void;
}

interface TransitionProps {
  from: string[];
  to: string[];
  children: ReactElement<Transitionable>;
}

export default function Transition({
  children,
  from: _from,
  to: _to,
}: TransitionProps) {
  const ctx = useContext(AnimationTreeContext);

  const id = useMemo(
    () => "__transition__" + Math.random().toString(36).slice(-5),
    []
  );

  const transition = useMemo(() => {
    const from = ctx.path.concat(_from);
    const to = ctx.path.concat(_to);
    return {
      from,
      to,
      trans: ctx.path.concat(id),
      target: [],
    };
  }, []);

  useEffect(() => {
    ctx.node.transition.push(transition);
  }, []);

  if (children) {
    return React.cloneElement(children, {
      name: id,
      onAnimationEnd: () => {
        if (transition.target.length > 0) {
          ctx.switchTo(transition.target);
          transition.target = [];
        }
      },
      onDeactive: () => {
        transition.target = [];
      },
    });
  }

  return null;
}

// 优先级
// 1. from 长度
// 2. to 长度
// 3. 层级深度
export function findTransition(
  n: StateNode,
  from: string[],
  to: string[]
): TransitionItem | null {
  if (from.length === 0 || to.length === 0) {
    return null;
  }

  let transitions = [];
  let node = n;

  for (let i = 0; i < from.length; i++) {
    const ts = node.transition.filter(
      (item) => startWith(from, item.from) && startWith(to, item.to)
    );
    transitions.push(...ts);

    node = node.children[from[i]] as StateNode;

    if (!node || isLeafNode(node)) {
      break;
    }
  }

  if (transitions.length > 0) {
    const maxFromLength = Math.max(...transitions.map((t) => t.from.length));
    transitions = transitions.filter((t) => t.from.length === maxFromLength);
    const maxToLength = Math.max(...transitions.map((t) => t.to.length));
    transitions = transitions.filter((t) => t.to.length === maxToLength);
    return transitions[transitions.length - 1];
  }

  return null;
}

function startWith(s: string[], p: string[]): boolean {
  if (s.length < p.length) {
    return false;
  }
  for (let i = 0; i < p.length; i++) {
    if (s[i] !== p[i]) {
      return false;
    }
  }
  return true;
}
