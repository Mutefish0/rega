import { useState } from "react";
import {
  Sprite2D,
  ShapeCollider2D,
  ActiveCollisionTypes,
  Relative,
  useSoundPlayer,
} from "rega";
import { CollisionGroup } from "../../constants";
import { spr } from "../utils";

interface Props {
  onShrink?: () => void;
}

export default function Spring({ onShrink }: Props) {
  const [state, setState] = useState<"idle" | "shrink">("idle");

  const sfx = useSoundPlayer("/sounds/spring.wav");

  return (
    <>
      <Sprite2D
        textureId="/images/atlas.png"
        clip={spr(state === "shrink" ? 19 : 18)}
        padding={0.05}
      />
      <Relative translation={{ x: 0, y: 1.5, z: 0 }}>
        <ShapeCollider2D
          shape="cuboid"
          sensor
          size={[8, 1]}
          collisionGroup={CollisionGroup.Sensor}
          collisionMask={CollisionGroup.Player}
          userData={{ type: "spring" }}
          activeCollisionTypes={
            ActiveCollisionTypes.DEFAULT | ActiveCollisionTypes.KINEMATIC_FIXED
          }
          onCollisionChange={(cols) => {
            if (cols.find((col) => col?.userData?.type === "player")) {
              setState("shrink");
              sfx.play();
              setTimeout(() => setState("idle"), 333);
              onShrink && onShrink();
            }
          }}
        />
      </Relative>
      <Relative translation={{ x: 0, y: -1.5, z: 0 }}>
        <ShapeCollider2D
          shape="cuboid"
          size={[8, 3]}
          userData={{ type: "spring" }}
          collisionGroup={CollisionGroup.Solid}
          collisionMask={CollisionGroup.Player}
          activeCollisionTypes={
            ActiveCollisionTypes.DEFAULT | ActiveCollisionTypes.KINEMATIC_FIXED
          }
        />
      </Relative>
    </>
  );
}
