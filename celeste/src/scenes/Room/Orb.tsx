import { useState } from "react";
import {
  Sprite2D,
  Animation,
  Relative,
  ShapeCollider2D,
  ActiveCollisionTypes,
  Box2D,
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

function Star() {
  return (
    <>
      <Box2D color="#fff1e8" size={[1, 3]} />
      <Box2D color="#fff1e8" size={[3, 1]} />
    </>
  );
}

export default function Orb() {
  return (
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
      <Sprite2D textureId="/images/atlas.png" clip={spr(102)} padding={0.05} />
    </>
  );
}
