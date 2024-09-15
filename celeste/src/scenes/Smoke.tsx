import { useMemo, useState } from "react";
import { Animation, Sprite2D, RigidBody2D, Relative } from "rega";
import { spr } from "./utils";

const clips = [spr(29), spr(30), spr(30), spr(31)];

const animConfig = {
  steps: clips,
  duration: 200,
};

interface Props {
  autoDestroy?: boolean;
}

// 500ms
export default function Smoke({ autoDestroy }: Props) {
  const [state, setState] = useState<"idle" | "destory">("idle");

  const { offset, flip, initialVelocity } = useMemo(() => {
    const offset = {
      x: -1 + Math.random() * 2,
      y: -(-1 + Math.random() * 2),
      z: 0,
    };

    const flip = {
      x: Math.random() > 0.5,
      y: Math.random() > 0.5,
    };

    const initialVelocity = {
      y: 0.1 * 30,
      x: (0.3 + Math.random() * 0.2) * 30,
    };

    return {
      offset,
      flip,
      initialVelocity,
    };
  }, []);

  if (state === "destory") {
    return null;
  }

  return (
    <Relative translation={offset}>
      <RigidBody2D type="kinematic-velocity" initialVelocity={initialVelocity}>
        <Animation
          config={animConfig}
          renderItem={(clip) => (
            <Sprite2D
              textureId="/images/atlas.png"
              clip={clip}
              flipX={flip.x}
              flipY={flip.y}
            />
          )}
          onAnimationEnd={() => {
            if (autoDestroy) {
              setTimeout(() => setState("destory"), 300);
            }
          }}
        />
      </RigidBody2D>
    </Relative>
  );
}
