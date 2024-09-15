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

export default function Spring() {
  const [sprite, setSprite] = useState(18);
  const sfx = useSoundPlayer("/sounds/spring.wav");

  return (
    <>
      <Sprite2D
        textureId="/images/atlas.png"
        clip={spr(sprite)}
        padding={0.05}
      />
      <Relative translation={{ x: 0, y: 1.5, z: 0 }}>
        <ShapeCollider2D
          shape="cuboid"
          sensor
          size={[8, 1]}
          collisionGroup={CollisionGroup.Sensor}
          collisionMask={CollisionGroup.Player}
          activeCollisionTypes={
            ActiveCollisionTypes.DEFAULT | ActiveCollisionTypes.KINEMATIC_FIXED
          }
          onCollisionChange={(cols) => {
            if (cols.find((col) => col?.userData?.type === "player")) {
              setSprite(19);
              sfx.play();
              setTimeout(() => setSprite(18), 333);
            }
          }}
        />
      </Relative>

      <Relative translation={{ x: 0, y: -1.5, z: 0 }}>
        <ShapeCollider2D
          shape="cuboid"
          size={[8, 5]}
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
