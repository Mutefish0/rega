import { useMemo } from "react";
import { Sprite2D, Relative, ShapeCollider2D, RigidBody2D } from "rega";
import { spr } from "../utils";
import { CollisionGroup } from "../../constants";

interface Props {
  dir: number;
}

export default function Platform({ dir }: Props) {
  const userData = useMemo(
    () => ({
      type: "platform",
      vx: dir > 0 ? 19 : -19,
    }),
    [dir]
  );

  return (
    <RigidBody2D
      type="kinematic-velocity"
      initialVelocity={{ x: dir > 0 ? 19 : -19, y: 0 }}
      onUpdate={(rb) => {
        if (rb.position.x > 136) {
          rb.commitPosition({ x: -16 });
        }
        if (rb.position.x < -16) {
          rb.commitPosition({ x: 136 });
        }
      }}
    >
      <Relative translation={{ x: 4, y: 2.5 }}>
        <ShapeCollider2D
          shape="cuboid"
          size={[16, 1]}
          collisionGroup={CollisionGroup.Platform}
          collisionMask={CollisionGroup.Solid}
          userData={userData}
        />
      </Relative>
      <Sprite2D textureId="/images/atlas.png" clip={spr(11)} padding={0.05} />
      <Relative translation={{ x: 8 }}>
        <Sprite2D textureId="/images/atlas.png" clip={spr(12)} padding={0.05} />
      </Relative>
    </RigidBody2D>
  );
}
