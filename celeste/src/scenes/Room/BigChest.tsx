import { useEffect, useState } from "react";
import {
  Sprite2D,
  Animation,
  Relative,
  useSoundPlayer,
  ShapeCollider2D,
  ActiveCollisionTypes,
  useParticles,
  Box2D,
  RigidBody2D,
  ZIndex,
} from "rega";
import { spr } from "../utils";
import { CollisionGroup } from "../../constants";
import Smoke from "../Smoke";
import Orb from "./Orb";

interface Props {
  onBigChestOpen: () => void;
}

function* emitParticles() {
  const dt = 33;
  let t = 0;
  while (t < 2000) {
    const spd = (8 + Math.random() * 8) * 30;
    yield [
      { spd, ox: 1 + Math.random() * 14, h: 32 + Math.random() * 32 },
      dt,
    ] as const;
    t += dt;
  }
}

export default function BigChest({ onBigChestOpen }: Props) {
  const [state, setState] = useState<"idle" | "opening" | "opened">("idle");

  const sfx = useSoundPlayer("/sounds/big_chest.wav");

  const { list, emit } = useParticles<{ ox: number; spd: number; h: number }>();

  useEffect(() => {
    //
  }, [state]);

  if (state === "opening" || state === "opened") {
    return (
      <>
        <Relative translation={{ y: -4, x: 4 }}>
          <Smoke />
        </Relative>
        <Relative translation={{ y: -4, x: 12 }}>
          <Smoke />
        </Relative>
        <ZIndex zIndex={2}>
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
        </ZIndex>
        {state === "opening" && (
          <>
            <Animation
              genFunc={emitParticles}
              onAnimationFrame={({ ox, spd, h }) => {
                emit({
                  lifetime: 2000,
                  data: {
                    ox,
                    spd,
                    h,
                  },
                });
              }}
              onAnimationEnd={() => {
                console.log("end!!");

                setState("opened");
              }}
            />
            {list.map((p) => (
              <Relative translation={{ x: p.data.ox, y: -16 }}>
                <RigidBody2D
                  type="kinematic-velocity"
                  initialVelocity={{ x: 0, y: p.data.spd }}
                >
                  <ZIndex zIndex={1}>
                    <Box2D
                      anchor="bottom"
                      key={p.id}
                      size={[2, p.data.h]}
                      color="#fff"
                    />
                  </ZIndex>
                </RigidBody2D>
              </Relative>
            ))}
          </>
        )}
        {state === "opened" && (
          <Relative translation={{ x: 4, y: 8 }}>
            <Orb />
          </Relative>
        )}
      </>
    );
  }

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
              setState("opening");
              onBigChestOpen();
              sfx.play();
            }
          }}
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
