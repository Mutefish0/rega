import { useEffect, useState, useRef } from "react";
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

const content =
  "-- celeste mountain --\nthis memorial to those\n perished on the climb";

export default function Message() {
  const [state, setState] = useState<"idle" | "showing">("idle");
  const [text, setText] = useState("");

  const sfx = useSoundPlayer("/sounds/type.wav");

  const ref = useRef({ hidingTimeout: null });

  useEffect(() => {
    if (state === "showing") {
      let i = 0;
      const itv = setInterval(() => {
        i++;
        setText(content.slice(0, i));
        if (i >= content.length) {
          clearInterval(itv);
        }
        sfx.play();
      }, 100);
      return () => {
        clearInterval(itv);
      };
    }
  }, [state]);

  return (
    <>
      {state === "showing" && (
        <GUIView target="GUI">
          <View
            style={{
              marginTop: 380,
              marginLeft: "auto",
              marginRight: "auto",
              flexDirection: "row",
              width: 464,
            }}
          >
            <Text
              style={{
                paddingLeft: 10,
                paddingTop: 10,
                fontFamily: "celeste",
                fontSize: 28,
                color: "#000",
                backgroundColor: "#fff1e8",
                letterSpacing: -8,
              }}
            >
              {text}
            </Text>
          </View>
        </GUIView>
      )}
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
          const colPlayer = cols.find(
            (col) => col?.userData?.type === "player"
          );
          if (colPlayer) {
            if (state === "idle" && colPlayer.type === "enter") {
              setState("showing");
            } else if (state === "showing" && colPlayer.type == "leave") {
              ref.current.hidingTimeout = setTimeout(() => {
                setState("idle");
                setText("");
              }, 500);
            }
          }
        }}
      />
    </>
  );
}
