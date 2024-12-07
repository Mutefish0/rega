import { useState } from "react";
import {
  Sprite2D,
  Animation,
  Relative,
  useSoundPlayer,
  ShapeCollider2D,
  ActiveCollisionTypes,
  Box2D,
  AnimConfig,
  smoothstep,
} from "rega";

import { times } from "lodash";
import { spr } from "../utils";
import { CollisionGroup } from "../../constants";

const r8 = times(8);

function* anim() {
  let shift = 0;
  while (true) {
    shift += Math.PI / 18;
    yield [shift, 33] as const;
  }
}

const animOrbLift: AnimConfig<number> = {
  duration: 600,
  steps: smoothstep(-12, 6, 20, "easeQuadIn"),
};

function Star() {
  return (
    <>
      <Box2D color="#fff1e8" size={[1, 3]} />
      <Box2D color="#fff1e8" size={[3, 1]} />
    </>
  );
}

interface Props {
  onGetOrb: () => void;
  shake: (ms: number) => void;
  freeze: (ms: number) => void;
  setMusic: (src: string) => void;
}

export default function Orb({ onGetOrb, shake, freeze, setMusic }: Props) {
  const sfx = useSoundPlayer("/sounds/orb.wav");

  const [state, setState] = useState<
    "flying" | "settle" | "shaking" | "destroyed"
  >("flying");

  if (state === "destroyed") {
    return null;
  }

  return (
    <Animation
      config={animOrbLift}
      renderItem={(y) => (
        <Relative translation={{ x: 8, y }}>
          <>
            <Animation
              genFunc={anim}
              renderItem={(shift) =>
                r8.map((i) => (
                  <Relative
                    key={i}
                    translation={{
                      x: Math.cos((i / 8) * 2 * Math.PI + shift) * 8,
                      y: Math.sin((i / 8) * 2 * Math.PI + shift) * 8,
                    }}
                  >
                    <Star />
                  </Relative>
                ))
              }
            />
            {state === "settle" && (
              <ShapeCollider2D
                shape="cuboid"
                size={[8, 8]}
                collisionGroup={CollisionGroup.Sensor}
                collisionMask={CollisionGroup.Solid}
                activeCollisionTypes={
                  ActiveCollisionTypes.DEFAULT |
                  ActiveCollisionTypes.KINEMATIC_FIXED
                }
                onCollisionChange={(cols) => {
                  const colPlayer = cols.find(
                    (col) => col?.userData?.type === "player"
                  );
                  if (colPlayer.type === "enter") {
                    sfx.play(() => setMusic("/sounds/area3.mp3"));
                    setState("shaking");
                    shake(400);
                    freeze(400);
                    setTimeout(() => {
                      setState("destroyed");
                      onGetOrb();
                    }, 300);
                  }
                }}
              />
            )}
            <Sprite2D
              textureId="/images/atlas.png"
              clip={spr(102)}
              padding={0.05}
            />
          </>
        </Relative>
      )}
      onAnimationEnd={() => setState("settle")}
    />
  );
}
