import React, { ReactElement, useState } from "react";

export interface Pipeable<T> {
  name?: string;
  loop?: boolean;
  onCheckPaused?: () => boolean;
  onAnimationEnd?: () => void;
  onAnimationFrame?: (value: T, frame: number) => void;
}

interface Props<T> extends Pipeable<T> {
  children: ReactElement<Pipeable<T>> | ReactElement<Pipeable<T>>[];
}

export default function AnimationPipe<T>({
  name,
  loop,
  children,
  onAnimationFrame,
  onCheckPaused,
  onAnimationEnd,
}: Props<T>) {
  const len = React.Children.count(children);
  const [index, setIndex] = useState(0);

  const currChild = React.Children.toArray(children)[index] as ReactElement<
    Pipeable<T>
  >;

  const enhanced = React.cloneElement(currChild, {
    name: name ?? currChild.props.name,
    onAnimationEnd: () => {
      if (!currChild.props.loop) {
        // step to next pipe
        const nextIndex = index + 1;
        if (nextIndex >= len) {
          onAnimationEnd?.();
          if (loop) {
            setIndex(0);
          }
        } else {
          setIndex(nextIndex);
        }
      } else {
        // loop last pipe
        if (index >= len - 1) {
          onAnimationEnd?.();
        }
      }
    },
    onAnimationFrame,
    onCheckPaused,
  });

  return enhanced;
}
