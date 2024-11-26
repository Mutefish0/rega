import { useState } from "react";
import {
  Sprite2D,
  Animation,
  AnimConfig,
  Relative,
  ShapeCollider2D,
  ActiveCollisionTypes,
  useSoundPlayer,
} from "rega";
import { spr } from "../utils";
import { CollisionGroup } from "../../constants";

// 118 - 012
const animWave: AnimConfig<[number, number, number, number]> = {
  steps: [spr(118), spr(119), spr(120)],
  duration: 450,
  loop: true,
};

export default function Flag() {
  const [state, setState] = useState<"idle" | "show">("idle");
  const sfx = useSoundPlayer("/sounds/flag.wav");

  return (
    <>
      <Animation
        config={animWave}
        renderItem={(clip) => (
          <Sprite2D textureId="/images/atlas.png" clip={clip} padding={0.05} />
        )}
      />
      {state === "idle" && (
        <ShapeCollider2D
          shape="cuboid"
          size={[8, 8]}
          collisionGroup={CollisionGroup.Sensor}
          collisionMask={CollisionGroup.Player}
          activeCollisionTypes={
            ActiveCollisionTypes.DEFAULT | ActiveCollisionTypes.KINEMATIC_FIXED
          }
          onCollisionChange={() => {
            sfx.play();
            setState("show");
          }}
          userData={{ type: "flag" }}
        />
      )}
    </>
  );
}
