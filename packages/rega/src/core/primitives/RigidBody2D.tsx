import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
} from "react";
import RigidBodyContext, { RigidBodyRef } from "./RigidBodyContext";
import PhysicsContext from "../primitives/PhysicsContext";
import {
  useRightBeforePhysicsFrame,
  useRightAfterPhysicsFrame,
} from "../primitives/Physics";
import { RigidBodyDesc, RigidBodyType, Vector } from "@dimforge/rapier2d";
import Absolute from "./Absolute";
import useTransform from "../hooks/useTransform";
import useConst from "../hooks/useConst";

export { RigidBody } from "@dimforge/rapier2d";

interface Props {
  type: "dynamic" | "kinematic-position" | "kinematic-velocity" | "fixed";
  mass?: number;
  ccd?: boolean;
  gravityScale?: number;
  rotationLocked?: boolean;
  dominance?: number;
  children: React.ReactNode;
  initialVelocity?: { x: number; y: number };
  onUpdate?: (ref: RigidBodyRef, deltaTime: number, time: number) => void;
}

export type { RigidBodyRef };

export default React.forwardRef<RigidBodyRef, Props>(function RigidBody2D(
  {
    type,
    mass = 1,
    ccd = false,
    rotationLocked = false,
    dominance = 0,
    gravityScale = 1,
    children,
    initialVelocity,
    onUpdate,
  },
  _ref
) {
  const transform = useTransform();
  const ctx = useContext(PhysicsContext);

  const initialPosition = useMemo(
    () => ({ ...transform.transform.translation }),
    []
  );
  const initialRoation = transform.transform.rotation.z;

  const body = useMemo(() => {
    const desc =
      type === "dynamic"
        ? RigidBodyDesc.dynamic()
        : type === "fixed"
        ? RigidBodyDesc.fixed()
        : type === "kinematic-position"
        ? RigidBodyDesc.kinematicPositionBased()
        : type === "kinematic-velocity"
        ? RigidBodyDesc.kinematicVelocityBased()
        : RigidBodyDesc.fixed();

    desc.mass = mass;
    desc.setTranslation(initialPosition.x, initialPosition.y);
    desc.setRotation(initialRoation);
    return ctx.createRigidBody(desc);
  }, []);

  const [_, setCounter] = useState(0);

  const state = useConst({
    stagedVelocity: undefined as { x?: number; y?: number } | undefined,
    stagedPosition: undefined as { x?: number; y?: number } | undefined,
  });

  const rbCtx = useMemo(
    () => ({
      position: initialPosition,
      rotation: initialRoation,
      velocity: { x: 0, y: 0 },
      commitVelocity,
      commitPosition,
      applyImpulse,
      rigidBody: body,
    }),
    []
  );

  useImperativeHandle(_ref, () => rbCtx, []);

  useEffect(() => {
    body.setAdditionalMass(mass, true);
  }, [mass]);

  useEffect(() => {
    const rtype =
      type === "fixed"
        ? RigidBodyType.Fixed
        : type === "dynamic"
        ? RigidBodyType.Dynamic
        : type === "kinematic-position"
        ? RigidBodyType.KinematicPositionBased
        : type === "kinematic-velocity"
        ? RigidBodyType.KinematicVelocityBased
        : RigidBodyType.Fixed;
    body.setBodyType(rtype, true);
  }, [type]);

  useEffect(() => {
    body.lockRotations(rotationLocked, true);
  }, [rotationLocked]);

  useEffect(() => {
    body.setDominanceGroup(dominance);
  }, [dominance]);

  useEffect(() => {
    body.enableCcd(ccd);
  }, [ccd]);

  useEffect(() => {
    body.setGravityScale(gravityScale, true);
  }, [gravityScale]);

  useRightBeforePhysicsFrame(() => {
    const isKinematicPositionBased =
      body.bodyType() === RigidBodyType.KinematicPositionBased;
    const isKinematicVelocityBased =
      body.bodyType() === RigidBodyType.KinematicVelocityBased;

    if (
      state.stagedPosition &&
      (isKinematicPositionBased || isKinematicVelocityBased)
    ) {
      const t = body.translation();

      if (isKinematicPositionBased) {
        body.setNextKinematicTranslation({
          x: state.stagedPosition.x ?? t.x,
          y: state.stagedPosition.y ?? t.y,
        });
      } else {
        body.setTranslation(
          {
            x: state.stagedPosition.x ?? t.x,
            y: state.stagedPosition.y ?? t.y,
          },
          true
        );
      }
    } else if (state.stagedVelocity) {
      const v = body.linvel();
      body.setLinvel(
        {
          x: state.stagedVelocity.x ?? v.x,
          y: state.stagedVelocity.y ?? v.y,
        },
        true
      );
    }
  }, []);

  useRightAfterPhysicsFrame((deltaTime, time) => {
    state.stagedVelocity = undefined;
    state.stagedPosition = undefined;

    let update = false;
    const t = body.translation();
    const r = body.rotation();
    const v = body.linvel();

    const diffX = Math.abs(t.x - rbCtx.position.x);
    const diffY = Math.abs(t.y - rbCtx.position.y);
    const diffVx = Math.abs(v.x - rbCtx.velocity.x);
    const diffVy = Math.abs(v.y - rbCtx.velocity.y);

    if (
      diffX > ctx.minDistance ||
      diffY > ctx.minDistance ||
      diffVx > ctx.minVelocity ||
      diffVy > ctx.minVelocity
    ) {
      update = true;
    }

    rbCtx.position.x = t.x;
    rbCtx.position.y = t.y;
    rbCtx.rotation = r;
    rbCtx.velocity.x = v.x;
    rbCtx.velocity.y = v.y;

    if (update) {
      setCounter((c) => c + 1);
      onUpdate?.(rbCtx, deltaTime, time);
    }
  }, []);

  useEffect(() => {
    if (initialVelocity) {
      commitVelocity(initialVelocity);
    }
    return () => {
      ctx.removeRigidBody(body);
    };
  }, [body]);

  function commitVelocity({ x, y }: { x?: number; y?: number }) {
    if (!state.stagedVelocity) {
      state.stagedVelocity = { x, y };
    } else {
      if (x !== undefined) {
        state.stagedVelocity.x = x;
      }
      if (y !== undefined) {
        state.stagedVelocity.y = y;
      }
    }
  }

  function commitPosition({ x, y }: { x?: number; y?: number }) {
    if (!state.stagedPosition) {
      state.stagedPosition = { x, y };
    } else {
      if (x !== undefined) {
        state.stagedPosition.x = x;
      }
      if (y !== undefined) {
        state.stagedPosition.y = y;
      }
    }
  }

  function applyImpulse({ x, y }: { x: number; y: number }) {
    body.applyImpulse({ x, y }, true);
  }

  return (
    <RigidBodyContext.Provider value={rbCtx}>
      <Absolute
        translation={rbCtx.position}
        rotation={{ x: 0, y: 0, z: rbCtx.rotation }}
      >
        {children}
      </Absolute>
    </RigidBodyContext.Provider>
  );
});
