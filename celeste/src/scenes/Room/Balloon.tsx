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
} from "rega";
import { times } from "lodash";
import { spr } from "../utils";
import { CollisionGroup } from "../../constants";
import Smoke from "../Smoke";

// duration: 3300ms = 100 * 33ms
const animConfig = {
  steps: times(100, (i) => 2 * Math.sin((i / 100) * 2 * Math.PI)),
  duration: 3300,
  loop: true,
};

// duration: 1200ms  = 400ms * 3
const flagAnimConfig = {
  steps: [spr(13), spr(14), spr(15)],
  duration: 1200,
  loop: true,
};

export default function Ballon() {
  const [state, setState] = useState<"idle" | "hide">("idle");

  const renewSfx = useSoundPlayer("/sounds/renew.wav");
  const sfx = useSoundPlayer("/sounds/get_balloon.wav");

  const { list, emit } = useParticles<{ x: number; y: number }>();

  return (
    <>
      {list.map((p) => (
        <Absolute key={p.id} translation={{ x: p.data.x, y: p.data.y }}>
          <Smoke />
        </Absolute>
      ))}
      {state !== "hide" && (
        <Animation
          config={animConfig}
          renderItem={(y) => (
            <Relative translation={{ y }}>
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
                  const col = cols.find(
                    (col) =>
                      col.contactData &&
                      col?.userData?.type === "player" &&
                      col?.userData?.hasDash
                  );
                  if (col) {
                    sfx.play();
                    emit({
                      lifetime: 400,
                      data: col.contactData!.solverContacts[0],
                    });
                    setState("hide");
                    setTimeout(() => {
                      renewSfx.play();
                      setState("idle");
                    }, 2000);
                  }
                }}
                userData={{ type: "balloon" }}
              />
              <Sprite2D
                textureId="/images/atlas.png"
                clip={spr(22)}
                padding={0.05}
              />
              <Relative translation={{ y: -6 }}>
                <Animation
                  config={flagAnimConfig}
                  renderItem={(clip) => (
                    <Sprite2D
                      textureId="/images/atlas.png"
                      clip={clip}
                      padding={0.05}
                    />
                  )}
                />
              </Relative>
            </Relative>
          )}
        />
      )}
    </>
  );
}
