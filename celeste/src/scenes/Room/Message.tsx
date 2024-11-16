import { useState } from "react";
import {
  Sprite2D,
  Animation,
  Relative,
  ShapeCollider2D,
  ActiveCollisionTypes,
  useSoundPlayer,
  useParticles,
  Absolute,
  GUIView,
  RenderGroup,
  View,
  Text,
} from "rega";
import { CollisionGroup } from "../../constants";

export default function Message() {
  const [state, setState] = useState<"idle" | "typing">("idle");

  if (state === "typing") {
    return (
      <GUIView target="GUI">
        <Text
          style={{
            fontFamily: "celeste",
            fontSize: 16,
            color: "#fff",
            letterSpacing: -2,
          }}
        >
          Hey, I'm a message!
        </Text>
      </GUIView>
    );
  }

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
        anchor="top-left"
        onCollisionChange={(cols) => {
          if (
            state === "idle" &&
            cols.find((col) => col?.userData?.type === "player")
          ) {
            console.log("got message");
            setState("typing");
          }
        }}
      />
    </>
  );
}
