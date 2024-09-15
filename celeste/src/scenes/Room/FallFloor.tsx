import { useState } from "react";
import {
  Sprite2D,
  ShapeCollider2D,
  ActiveCollisionTypes,
  Relative,
  Animation,
  useParticles,
  useSoundPlayer,
} from "rega";

import Smoke from "../Smoke";
import { CollisionGroup } from "../../constants";

import { spr } from "../utils";

const breakingAnim = {
  steps: [spr(23), spr(24), spr(25)],
  duration: 500,
};

export default function FallFloor() {
  const [state, setState] = useState<"idle" | "breaking" | "hiding">("idle");

  const { emit, list } = useParticles<void>();

  const renewSfx = useSoundPlayer("/sounds/renew.wav");
  const breakSfx = useSoundPlayer("/sounds/break_fall_floor.wav");

  return (
    <>
      {state === "idle" && (
        <Sprite2D textureId="/images/atlas.png" clip={spr(23)} padding={0.05} />
      )}
      {state === "breaking" && (
        <Animation
          config={breakingAnim}
          renderItem={(clip) => (
            <Sprite2D
              textureId="/images/atlas.png"
              clip={clip}
              padding={0.05}
            />
          )}
          onAnimationEnd={() => {
            setState("hiding");
            setTimeout(() => {
              emit({ lifetime: 300 });
              renewSfx.play();
              setState("idle");
            }, 2000);
          }}
        />
      )}
      {state === "idle" && (
        <Relative translation={{ x: 0, y: 4.5, z: 0 }}>
          <ShapeCollider2D
            shape="cuboid"
            size={[8, 1]}
            collisionGroup={CollisionGroup.Sensor}
            collisionMask={CollisionGroup.Solid}
            activeCollisionTypes={
              ActiveCollisionTypes.DEFAULT |
              ActiveCollisionTypes.KINEMATIC_FIXED
            }
            onCollisionChange={() => {
              breakSfx.play();
              setState("breaking");
            }}
          />
        </Relative>
      )}
      {(state === "breaking" || state === "idle") && (
        <ShapeCollider2D
          shape="cuboid"
          size={[8, 8]}
          collisionGroup={CollisionGroup.Solid}
        />
      )}
      {list.map((p) => (
        <Smoke key={p.id} />
      ))}
    </>
  );
}
