import { useContext, useEffect, useMemo, useState } from "react";
import useAnimation, { AnimationConfig } from "./useAnimation";
import { AnimationTreeContext, LeafNode } from "./AnimationTree";

//@TODO step support geneartor
export interface AnimationProps<T> extends AnimationConfig<T> {
  name?: string;
  onCheckPaused?: () => boolean;
  onAnimationEnd?: () => void;
  onAnimationFrame?: (value: T) => void;
  renderItem?: (value: T) => React.ReactNode;
}

export default function Animation<T>({
  name = "",
  renderItem,
  onAnimationFrame: _onAnimationFrame,
  ...rest
}: AnimationProps<T>) {
  const ctx = useContext(AnimationTreeContext);

  const [value, setValue] = useState<T>();

  const node = useMemo<LeafNode>(
    () => ({
      children: null,
      active: false,
    }),
    []
  );

  useEffect(() => {
    if (ctx && name) {
      ctx.node.children[name] = node;
      ctx.drive();
    }
  }, []);

  const extraProps = useMemo(() => {
    return ctx && name
      ? {
          onCheckActive: () => node.active,
          onAnimationFrame: ctx.onAnimationFrame,
        }
      : ctx && !name
      ? {
          onCheckActive: () => false,
        }
      : {
          onCheckActive: () => true,
        };
  }, []);

  function onAnimationFrame(value: T) {
    _onAnimationFrame?.(value);
    if (renderItem) {
      setValue(value);
    }
  }

  useAnimation({ onAnimationFrame, ...rest, ...extraProps });

  if (renderItem && typeof value !== "undefined") {
    return renderItem(value);
  }

  return null;
}
