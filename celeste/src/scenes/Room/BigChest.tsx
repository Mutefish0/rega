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
  smoothstep,
  AnimConfig,
} from "rega";
import { spr } from "../utils";
import { CollisionGroup } from "../../constants";
import Smoke from "../Smoke";
import Orb from "./Orb";

interface Props {
  toggleMusic: (on: boolean) => void;
  shake: (ms: number) => void;
}

function* emitParticles() {
  const dt = 33;
  let t = 0;
  while (t < 1900) {
    const spd = (8 + Math.random() * 8) * 30;
    yield [
      { spd, ox: 1 + Math.random() * 14, h: 32 + Math.random() * 32 },
      dt,
    ] as const;
    t += dt;
  }
}

const animOrbLift: AnimConfig<number> = {
  duration: 600,
  steps: smoothstep(-12, 6, 20, "easeQuadIn"),
};

export default function BigChest({ shake, toggleMusic }: Props) {
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
                  lifetime: 1800,
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
              <Relative key={p.id} translation={{ x: p.data.ox, y: -16 }}>
                <RigidBody2D
                  type="kinematic-velocity"
                  initialVelocity={{ x: 0, y: p.data.spd }}
                >
                  <ZIndex zIndex={1}>
                    <Box2D
                      anchor="bottom"
                      size={[2, p.data.h]}
                      color="#fff1e8"
                    />
                  </ZIndex>
                </RigidBody2D>
              </Relative>
            ))}
          </>
        )}
        {state === "opened" && (
          <Animation
            config={animOrbLift}
            renderItem={(y) => (
              <Relative translation={{ x: 8, y }}>
                <Orb />
              </Relative>
            )}
          />
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
              toggleMusic(false);
              sfx.play();
              shake(1800);
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
