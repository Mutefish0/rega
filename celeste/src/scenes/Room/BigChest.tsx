import { useEffect, useMemo, useState } from "react";
import {
  Sprite2D,
  Animation,
  Relative,
  useSoundPlayer,
  ShapeCollider2D,
  ActiveCollisionTypes,
} from "rega";
import { spr } from "../utils";
import { CollisionGroup } from "../../constants";

export default function BigChest() {
  return (
    <>
      <Relative translation={{ y: -8 }}>
        <ShapeCollider2D
          anchor="top-left"
          shape="cuboid"
          size={[16, 8]}
          collisionGroup={CollisionGroup.Sensor}
          collisionMask={CollisionGroup.Solid}
          activeCollisionTypes={
            ActiveCollisionTypes.DEFAULT | ActiveCollisionTypes.KINEMATIC_FIXED
          }
          onCollisionChange={(cols) => {
            if (cols.find((col) => col?.userData?.type === "player")) {
              // onGetFruit();
              // sfx.play();
              // setState("got_fruit");
              // setTimeout(() => {
              //   setState("destory");
              // }, 1000);
            }
          }}
          userData={{ type: "fruit" }}
        />
      </Relative>
      <Sprite2D
        anchor="top-left"
        textureId="/images/atlas.png"
        clip={spr(96)}
        padding={0.05}
      />
      <Relative translation={{ x: 8 }}>
        <Sprite2D
          anchor="top-left"
          textureId="/images/atlas.png"
          clip={spr(97)}
          padding={0.05}
        />
      </Relative>
      <Relative translation={{ y: -8 }}>
        <Sprite2D
          anchor="top-left"
          textureId="/images/atlas.png"
          clip={spr(112)}
          padding={0.05}
        />
      </Relative>
      <Relative translation={{ x: 8, y: -8 }}>
        <Sprite2D
          anchor="top-left"
          textureId="/images/atlas.png"
          clip={spr(113)}
          padding={0.05}
        />
      </Relative>
    </>
  );
}
