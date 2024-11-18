import React, { useEffect, useState } from "react";
import { Relative, Animation, Camera } from "rega";
import { times } from "lodash";

interface Props {
  shake: number;
  onShakeEnd: () => void;
}

export default function ShakeCamera({ shake, onShakeEnd }: Props) {
  const [animation, setAnimation] = useState<{
    duration: number;
    steps: Array<[number, number]>;
  }>();

  const [offset, setOffset] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (shake > 0 && !animation) {
      const n = Math.floor(shake / 33);
      const steps = times(
        n,
        () => [Math.random() * 2.5, Math.random() * 2.5] as [number, number]
      );
      setAnimation({ duration: shake, steps });
    }
  }, [shake, animation]);

  return (
    <>
      <Relative translation={{ x: offset[0], y: +offset[1] }}>
        <Camera
          type="orthographic"
          width={128}
          height={128}
          anchor="top-left"
        />
      </Relative>
      {!!animation && (
        <Animation
          config={animation}
          onAnimationFrame={(offset) => {
            setOffset(offset);
          }}
          onAnimationEnd={() => {
            setOffset([0, 0]);
            setAnimation(undefined);
            onShakeEnd();
          }}
        />
      )}
    </>
  );
}
