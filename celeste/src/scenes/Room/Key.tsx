import {} from "react";
import {
  Sprite2D,
  Animation,
  AnimConfig,
  ShapeCollider2D,
  ActiveCollisionTypes,
} from "rega";
import { spr } from "../utils";
import { CollisionGroup } from "../../constants";

const animConfig: AnimConfig<{
  clip: [number, number, number, number];
  flipX: boolean;
}> = {
  loop: true,
  duration: 3200,
  steps: [
    {
      clip: spr(10),
      flipX: false,
    },
    {
      clip: spr(9),
      flipX: false,
    },
    {
      clip: spr(8),
      flipX: false,
    },
    {
      clip: spr(9),
      flipX: false,
    },
    {
      clip: spr(10),
      flipX: false,
    },
    {
      clip: spr(9),
      flipX: true,
    },
    {
      clip: spr(8),
      flipX: true,
    },
    {
      clip: spr(9),
      flipX: true,
    },
  ],
};

interface Props {
  onGetKey: () => void;
}

export default function Key({ onGetKey }: Props) {
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
            onGetKey();
          }
        }}
      />
      <Animation
        config={animConfig}
        renderItem={({ clip, flipX }) => {
          return (
            <Sprite2D
              textureId="/images/atlas.png"
              clip={clip}
              flipX={flipX}
              padding={0.05}
            />
          );
        }}
      />
    </>
  );
}
