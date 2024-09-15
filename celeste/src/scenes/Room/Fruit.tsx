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
import { times } from "lodash";
import Lifeup from "../Lifeup";

interface Props {
  onGetFruit: () => void;
}

// duration: 1320ms = 40 * 33ms
const animConfig: AnimConfig<number> = {
  steps: times(40, (i) => 2.5 * Math.sin((i / 40) * 2 * Math.PI)),
  duration: 1320,
  loop: true,
};

export default function Fruit({ onGetFruit }: Props) {
  const [state, setState] = useState<"idle" | "got_fruit" | "destory">("idle");
  const sfx = useSoundPlayer("/sounds/get_fruit.wav");

  if (state === "destory") {
    return null;
  }

  if (state === "got_fruit") {
    return (
      <Relative translation={{ x: -12, y: 4, z: 0 }}>
        <Lifeup />
      </Relative>
    );
  }

  return (
    <>
      <Animation
        config={animConfig}
        renderItem={(y) => (
          <Relative translation={{ x: 0, y, z: 0 }}>
            <ShapeCollider2D
              shape="cuboid"
              size={[8, 8]}
              collisionGroup={CollisionGroup.Sensor}
              collisionMask={CollisionGroup.Solid}
              activeCollisionTypes={
                ActiveCollisionTypes.DEFAULT |
                ActiveCollisionTypes.KINEMATIC_FIXED
              }
              onCollisionChange={(cols) => {
                if (cols.find((col) => col?.userData?.type === "player")) {
                  onGetFruit();
                  sfx.play();
                  setState("got_fruit");
                  setTimeout(() => {
                    setState("destory");
                  }, 1000);
                }
              }}
              userData={{ type: "fruit" }}
            />
            <Sprite2D
              textureId="/images/atlas.png"
              clip={spr(26)}
              padding={0.05}
            />
          </Relative>
        )}
      />
    </>
  );
}
