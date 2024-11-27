import { useEffect, useState, useRef } from "react";
import {
  ShapeCollider2D,
  ActiveCollisionTypes,
  useSoundPlayer,
  View,
  Text,
  Absolute,
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
        <Absolute translation={{ x: 0, y: 0 }}>
          <View
            style={{
              width: 128,
              height: 128,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                marginTop: 92,
                flexDirection: "row",
                width: 120,
                height: 28,
              }}
            >
              <Text
                style={{
                  paddingTop: 4,
                  paddingLeft: 4,
                  paddingRight: 4,
                  lineHeight: 8,
                  fontFamily: "celeste",
                  fontSize: 5,
                  color: "#000",
                  backgroundColor: "#fff1e8",
                  letterSpacing: 2,
                }}
              >
                {text}
              </Text>
            </View>
          </View>
        </Absolute>
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
