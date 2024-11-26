import { useEffect, useRef, useState } from "react";
import {
  RigidBody2D,
  RigidBodyRef,
  ShapeCollider2D,
  useBeforePhysicsFrame,
  useConst,
  useGamepadMapping,
  useKeyboardMapping,
  mergeInputValues,
  Sprite2D,
  Relative,
  useSoundPlayer,
  useParticles,
  Particle,
  Absolute,
  useCharacterController,
} from "rega";

import { CollisionGroup } from "../../constants";

import Hair from "./Hair";
import Smoke from "../Smoke";

import { spr } from "../utils";

function approch(val: number, target: number, amount: number) {
  return val > target
    ? Math.max(val - amount, target)
    : Math.min(val + amount, target);
}

const JUMP_BUFFER = 0.166; // p8: 5/30 = 0.166  jbuffer
const COYOTE_TIME = 0.15; // p8: 6/30 = 0.2      grace

// celeste time step
const C_TIME_STEP = 1 / 30;
const SPEED_SCALE = 1 / C_TIME_STEP;
const SPRING_SPEED = 4.7 * SPEED_SCALE; // p8: -3
const JUMP_SPEED = 3.3 * SPEED_SCALE; // p8: -2

const GRAVITY_UP = JUMP_SPEED / 0.35; //350ms   p8: 0.21
const GRAVITY_DOWN = JUMP_SPEED / 0.2; //200ms  p8: 0.21

const HALF_GRAVITY_SPEED = 1.15 * SPEED_SCALE; // p8: 0.15
const MAX_FALL = -3.3 * SPEED_SCALE; // p8: 2
const MAX_FALL_SLIDE = -1.2 * SPEED_SCALE; // p8: 0.4

// 冲刺持续时间
const DASH_TIME = 0.133; // p8: 4/30 = 0.133  dash_time
const DASH_SPEED_FULL = 6 * SPEED_SCALE; // p8: 5
const DASH_ACCEL = DASH_SPEED_FULL / 0.15; // p8: 1.5

const DASH_SPEED_HALF = DASH_SPEED_FULL * 0.707; // p8: 5 * 0.70710678118f;
const DASH_SPEED_END = 3.3 * SPEED_SCALE; // p8: 2

const DASH_EFFECT_TIME = 0.3; // p8: 4/30 = 0.133  dash_time

const MAX_RUN = 2.35 * SPEED_SCALE; // p8: 1
const RUN_ACCEL = MAX_RUN / 0.066; // p8: 0.6
const RUN_DECCEL = (JUMP_SPEED - MAX_RUN) / 0.21; // p8: 0.15
const AIR_RUN_ACCEL = MAX_RUN / 0.099; // p8: 0.4

interface ParticleData {
  x: number;
  y: number;
}

export interface PlayerState {
  position: {
    x: number;
    y: number;
  };
}

interface Props {
  onPlayerUpdate: (state: PlayerState) => void;
  onPlayerDash: () => void;
  onPlayerSpike: (pos: { x: number; y: number }) => void;
  onPlayerGetFlag: () => void;
  freeze: boolean;
  gotOrb: boolean;
}

export default function Player({
  onPlayerUpdate,
  onPlayerDash,
  onPlayerGetFlag,
  freeze,
  gotOrb,
  onPlayerSpike,
}: Props) {
  const [flipX, setFlipX] = useState(false);
  const [sprite, setSprite] = useState(1);
  const [hasDash, setHasDash] = useState(false);
  const [hairColor, setHairColor] = useState("#fe014c");

  const dashSfx = useSoundPlayer("/sounds/dash.wav");
  const jumpSfx = useSoundPlayer("/sounds/jump.wav");
  const wallJumpSfx = useSoundPlayer("/sounds/wall_jump.wav");
  const dashLandSfx = useSoundPlayer("/sounds/dash_land.wav");

  const { list: smokes, emit } = useParticles<ParticleData>();

  const controller = useCharacterController({
    offset: 0.1,
    autostep: { maxHeight: 1, minWidth: 1 },
    collisionGroup: CollisionGroup.Player | CollisionGroup.Solid,
    collisionMask: CollisionGroup.Solid,
  });

  const s = useConst({
    prevJump: false as boolean,
    hasDashed: false as boolean,

    dashJump: 1,

    prevDash: false as boolean,
    isGrounded: true,

    vy: 0,
    vx: 0,
    flipX: false,

    jumpBufferTime: 0,
    coyoteTime: 0,
    dashTime: 0,
    dashEffectTime: 0,

    dashTargetX: 0,
    dashTargetY: 0,
    dashAccelY: 0,
    dashAccelX: 0,

    dashParticle: null as Particle<ParticleData> | null,
    slideParticle: null as Particle<ParticleData> | null,

    spriteRunningAnimTime: 0,
    lastRunningSprite: 1,

    spriteFlashAnimTime: 0,
    lastFlashSprite: 0,

    platformVx: 0,

    resetDashingTimer: null,
  });

  const gp = useGamepadMapping("player1", {
    jump: "b",
    dash: "a",
    x: "leftX",
    y: "-leftY",
  });

  const kb = useKeyboardMapping({
    jump: "c",
    dash: "x",
    x: { min: "ArrowLeft", max: "ArrowRight" },
    y: { min: "ArrowDown", max: "ArrowUp" },
  });

  useEffect(() => {
    if (gotOrb) {
      s.dashJump = 2;
    } else {
      s.dashJump = 1;
    }
  }, [gotOrb]);

  const rbRef = useRef<RigidBodyRef>(null);

  useBeforePhysicsFrame(
    (deltaTime, time) => {
      if (freeze) {
        return;
      }

      const rb = rbRef.current;
      if (rb) {
        onPlayerUpdate({
          position: {
            x: rb.position.x,
            y: rb.position.y,
          },
        });

        const dt = deltaTime / 1000;

        // check ground
        const downRet = controller.computeColliderMovement(
          { x: 0, y: -0.1 },
          {
            collisionMask:
              s.platformVx === 0
                ? CollisionGroup.Solid
                : CollisionGroup.Solid | CollisionGroup.Platform,
          }
        );

        // check wall
        const rightRet = controller.computeColliderMovement({ x: 0.1, y: 0 });
        const leftRet = controller.computeColliderMovement({ x: -0.1, y: 0 });

        const isRightWall = rightRet.collisions.find(
          (c) => c?.userData?.type !== "invisible-wall" && c.normal1.x < -0.99
        );
        const isLeftWall = leftRet.collisions.find(
          (c) => c?.userData?.type !== "invisible-wall" && c.normal1.x > 0.99
        );

        const rightJumpRet = controller.computeColliderMovement({ x: 3, y: 0 });
        const leftJumoRet = controller.computeColliderMovement({ x: -3, y: 0 });

        const isRightJumpWall = rightJumpRet.collisions.find(
          (c) => c?.userData?.type !== "invisible-wall" && c.normal1.x < -0.99
        );
        const isLeftJumpWall = leftJumoRet.collisions.find(
          (c) => c?.userData?.type !== "invisible-wall" && c.normal1.x > 0.99
        );

        let isSliding = false;

        let nextIsGrounded = false;
        let isSpring = false;

        for (const col of downRet.collisions) {
          if (col?.userData?.type === "spring") {
            isSpring = true;
          }
          if (col.normal1.y > 0.99) {
            nextIsGrounded = true;
          }
        }

        // refresh coyote
        if (s.isGrounded && !nextIsGrounded) {
          s.coyoteTime = COYOTE_TIME;
          s.platformVx = 0;
        } else if (!s.isGrounded && nextIsGrounded) {
          emit({
            lifetime: 400,
            data: { x: rb.position.x + 4, y: rb.position.y - 8 },
          });
        }

        s.isGrounded = nextIsGrounded;

        if (s.isGrounded) {
          if (s.hasDashed && s.dashTime <= 0) {
            // reset dash flag
            dashLandSfx.play();
            s.hasDashed = false;
            s.dashJump = gotOrb ? 2 : 1;

            setHasDash(false);
          }
        }

        const jumpPressd = !!(gp.jump || kb.jump);
        const dashPressd = !!(gp.dash || kb.dash);
        const x = mergeInputValues(gp.x, kb.x);
        const y = mergeInputValues(gp.y, kb.y);

        const jump = jumpPressd && !s.prevJump;
        s.prevJump = jumpPressd;

        const dash = dashPressd && !s.prevDash;
        s.prevDash = dashPressd;

        const inputX = Math.abs(x) > 0.15 ? x : 0;
        const inputY = Math.abs(y) > 0.15 ? y : 0;

        if (s.dashTime > 0) {
          s.vx = approch(s.vx, s.dashTargetX, s.dashAccelX * dt);
          s.vy = approch(s.vy, s.dashTargetY, s.dashAccelY * dt);
          if (!s.dashParticle || time - s.dashParticle.createdAt >= 25) {
            s.dashParticle = emit({
              lifetime: 400,
              data: {
                x: rb.position.x + 4,
                y: rb.position.y - 4,
              },
            });
          }
        } else {
          // run
          if (Math.abs(s.vx) > MAX_RUN) {
            s.vx = approch(s.vx, Math.sign(s.vx) * MAX_RUN, RUN_DECCEL * dt);
          } else {
            s.vx = approch(
              s.vx,
              inputX * MAX_RUN,
              s.isGrounded ? RUN_ACCEL * dt : AIR_RUN_ACCEL * dt
            );
          }

          // fall
          let gravity = s.vy > 0 ? GRAVITY_UP : GRAVITY_DOWN;
          let maxFall = MAX_FALL;

          if (Math.abs(s.vy) <= HALF_GRAVITY_SPEED) {
            gravity *= 0.65;
          }

          // wall slide
          if (!s.isGrounded) {
            if ((isRightWall && inputX > 0) || (isLeftWall && inputX < 0)) {
              maxFall = MAX_FALL_SLIDE;
              isSliding = true;
              if (!s.slideParticle || time - s.slideParticle.createdAt >= 200) {
                if (Math.random() < 0.2) {
                  s.slideParticle = emit({
                    lifetime: 400,
                    data: {
                      x: rb.position.x + 4 + (isRightWall ? 6 : -6),
                      y: rb.position.y - 4,
                    },
                  });
                }
              }
            }
          }

          if (!s.isGrounded) {
            s.vy = approch(s.vy, maxFall, gravity * dt);
          } else if (isSpring) {
            s.vx = s.vx * 0.2;
            s.vy = SPRING_SPEED;
          }

          // jump
          if (jump) {
            s.jumpBufferTime = JUMP_BUFFER;
          }

          if (s.jumpBufferTime > 0) {
            // noral jump
            if (s.isGrounded || (s.coyoteTime > 0 && s.vy <= 0)) {
              jumpSfx.play();
              emit({
                lifetime: 400,
                data: { x: rb.position.x + 4, y: rb.position.y - 8 },
              });
              s.vy = JUMP_SPEED;

              s.jumpBufferTime = 0;
              s.coyoteTime = 0;
            } else if (!s.isGrounded) {
              // wall jump
              if (isRightJumpWall || isLeftJumpWall) {
                wallJumpSfx.play();
                emit({
                  lifetime: 400,
                  data: {
                    x: rb.position.x + (isRightJumpWall ? 6 : -6),
                    y: rb.position.y,
                  },
                });

                s.vy = JUMP_SPEED;
                s.vx = isRightJumpWall ? -JUMP_SPEED : JUMP_SPEED;

                s.jumpBufferTime = 0;
                s.coyoteTime = 0;
              }
            }
          }

          if (s.jumpBufferTime > 0) {
            s.jumpBufferTime -= dt;
          }

          // dash
          if (dash && s.dashJump > 0) {
            dashSfx.play();
            onPlayerDash();
            s.hasDashed = true;
            s.dashJump--;

            setHasDash(true);

            s.dashEffectTime = DASH_EFFECT_TIME;
            s.dashTime = DASH_TIME;

            if (inputX && inputY) {
              s.vx = DASH_SPEED_HALF * Math.sign(inputX);
              s.vy = DASH_SPEED_HALF * Math.sign(inputY);
              s.dashAccelX = DASH_ACCEL * 0.7;
              s.dashAccelY = DASH_ACCEL * 0.7;
            } else if (inputX) {
              s.vx = DASH_SPEED_FULL * Math.sign(inputX);
              s.vy = 0;
              s.dashAccelX = DASH_ACCEL * 0.7;
            } else if (inputY) {
              s.vy = DASH_SPEED_FULL * Math.sign(inputY);
              s.vx = 0;
              s.dashAccelY = DASH_ACCEL * 0.7;
            } else {
              s.vy = 0;
              s.vx = s.flipX ? -DASH_SPEED_FULL : DASH_SPEED_FULL;
              s.dashAccelX = DASH_ACCEL * 0.7;
            }

            s.dashTargetX = DASH_SPEED_END * Math.sign(s.vx);
            s.dashTargetY = DASH_SPEED_END * Math.sign(s.vy);

            if (s.vy > 0) {
              s.dashTargetY *= 0.77;
            }
          }
        }

        const mx = (s.vx + s.platformVx) * dt;
        const my = s.vy * dt;

        let isLandingPlatform = false;
        if (s.vy < 0) {
          const ret = controller.computeColliderMovement(
            { x: mx, y: my },
            {
              collisionMask: CollisionGroup.Platform,
            }
          );
          const platformCol = ret.collisions.find((c) => c.normal1.y > 0.99);
          if (
            platformCol &&
            platformCol.collider &&
            !controller.contactCollider(platformCol.collider, 0)
          ) {
            isLandingPlatform = true;
          }
        }

        const ret = controller.computeColliderMovement(
          { x: mx, y: my },
          {
            collisionMask: isLandingPlatform
              ? CollisionGroup.Solid | CollisionGroup.Platform
              : CollisionGroup.Solid,
          }
        );

        if (ret.closestCollision) {
          if (
            ret.closestCollision.userData?.type === "fake-wall" &&
            s.dashEffectTime > 0
          ) {
            // collider with fake-wall
            ret.closestCollision.sendMessage("break");
            s.dashTime = 0;
            s.dashEffectTime = 0;
            s.vx = -Math.sign(s.vx) * 2.9 * SPEED_SCALE;
            s.vy = 2.9 * SPEED_SCALE;
          } else if (Math.abs(ret.closestCollision.normal1.y) > 0.99) {
            s.vy = 0;

            if (ret.closestCollision.userData?.type === "platform") {
              s.platformVx = ret.closestCollision.userData.vx;
            }
          } else if (Math.abs(ret.closestCollision.normal1.x) > 0.99) {
            s.vx = 0;
          }
        }

        // update flipX
        if (x > 0) {
          s.flipX = false;
          setFlipX(false);
        } else if (x < 0) {
          s.flipX = true;
          setFlipX(true);
        }

        let hairColor = "#fe014c";
        let baseSprite = 1;
        let spriteOffset = 0; // 0: red 128: blue 144: green 160: white

        if (isSliding) {
          baseSprite = 5;
        } else if (!s.isGrounded) {
          baseSprite = 3;
        } else if (inputY > 0) {
          baseSprite = 7;
        } else if (inputY < 0) {
          baseSprite = 6;
        } else if (Math.abs(s.vx) > 0) {
          if (s.spriteRunningAnimTime < 120) {
            s.spriteRunningAnimTime += deltaTime;
            baseSprite = s.lastRunningSprite;
          } else {
            s.spriteRunningAnimTime = 0;
            baseSprite = s.lastRunningSprite + 1;
            if (baseSprite > 4) {
              baseSprite = 1;
            }
          }
          s.lastRunningSprite = baseSprite;
        }

        if (gotOrb) {
          if (s.hasDashed && s.dashJump < 2) {
            if (s.dashJump > 0) {
              // red
              spriteOffset = 0;
              hairColor = "#ff004d"; // red
            } else {
              // blue
              spriteOffset = 128;
              hairColor = "#29adff"; // blue
            }
          } else {
            // flash
            // 144: green 160: white
            if (s.spriteFlashAnimTime < 120) {
              s.spriteFlashAnimTime += deltaTime;
            } else {
              s.spriteFlashAnimTime = 0;
              s.lastFlashSprite = s.lastFlashSprite > 0 ? 0 : 1;
            }
            spriteOffset = s.lastFlashSprite > 0 ? 160 : 144;
            hairColor = s.lastFlashSprite ? "#fff1e8" : "#00e436";
          }
        } else {
          if (s.hasDashed) {
            spriteOffset = 128; // blue
            hairColor = "#29adff"; // blue
          } else {
            spriteOffset = 0;
            hairColor = "#ff004d"; // red
          }
        }

        setSprite(baseSprite + spriteOffset);
        setHairColor(hairColor);

        if (s.coyoteTime > 0) {
          s.coyoteTime -= dt;
        }

        if (s.dashEffectTime > 0) {
          s.dashEffectTime -= dt;
        }

        if (s.dashTime > 0) {
          s.dashTime -= dt;
        }

        rb.commitPosition({
          x: rb.position.x + ret.movement.x,
          y: rb.position.y + ret.movement.y,
        });
      }
    },
    [onPlayerUpdate, freeze, gotOrb]
  );

  return (
    <>
      <RigidBody2D type="kinematic-position" ref={rbRef} ccd>
        <Relative
          translation={{
            x: flipX ? 5.5 : 2.5,
            y: -3.5,
            z: 0,
          }}
        >
          <Hair color={hairColor} />
        </Relative>
        <>
          {smokes.map((smoke) => (
            <Absolute
              translation={{ x: smoke.data.x, y: smoke.data.y }}
              key={smoke.id}
            >
              <Smoke />
            </Absolute>
          ))}
        </>
        <Relative translation={{ x: 1, y: -3, z: 0 }}>
          <ShapeCollider2D
            shape="cuboid"
            size={[6, 5]}
            characterControllerId={controller.id}
            collisionGroup={CollisionGroup.Player | CollisionGroup.Solid}
            collisionMask={CollisionGroup.Sensor}
            anchor="top-left"
            userData={{ type: "player", hasDash }}
            onCollisionChange={(cols) => {
              const flagCol = cols.find(
                (c) => c.type === "enter" && c.userData?.type === "flag"
              );

              const fruitCol = cols.find(
                (c) => c.type === "enter" && c.userData?.type === "fruit"
              );

              const balloonCol = cols.find(
                (c) => c.type === "enter" && c.userData?.type === "balloon"
              );

              if (fruitCol || balloonCol) {
                s.dashJump = gotOrb ? 2 : 1;
              }

              const spikeCol = cols.find(
                (c) => c.type === "enter" && c.userData?.type === "spike"
              );

              if (spikeCol) {
                //dir 1-top 2-bottom 3-left 4-right
                const dir = spikeCol.userData.dir;
                if (
                  (dir === 1 && s.vy <= 0) ||
                  (dir === 2 && s.vy >= 0) ||
                  (dir === 3 && s.vx >= 0) ||
                  (dir === 4 && s.vx <= 0)
                ) {
                  onPlayerSpike(spikeCol.contactData!.solverContacts[0]);
                }
              }

              if (flagCol) {
                onPlayerGetFlag();
              }
            }}
          />
        </Relative>

        <Sprite2D
          textureId="/images/atlas.png"
          flipX={flipX}
          clip={spr(sprite)}
          anchor="top-left"
        />
      </RigidBody2D>
    </>
  );
}
