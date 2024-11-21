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

export default function Orb() {
  return (
    <>
      <ShapeCollider2D
        shape="cuboid"
        size={[8, 8]}
        collisionGroup={CollisionGroup.Sensor}
        collisionMask={CollisionGroup.Solid}
        activeCollisionTypes={
          ActiveCollisionTypes.DEFAULT | ActiveCollisionTypes.KINEMATIC_FIXED
        }
        onCollisionChange={(cols) => {
          if (cols.find((col) => col?.userData?.type === "player")) {
            //
          }
        }}
      />
      <Sprite2D
        anchor="top-left"
        textureId="/images/atlas.png"
        clip={spr(102)}
        padding={0.05}
      />
    </>
  );
}
