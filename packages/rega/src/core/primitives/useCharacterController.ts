import { useMemo, useContext, useEffect } from "react";
import {
  Vector,
  CharacterCollision,
  Collider,
  ShapeContact,
} from "@dimforge/rapier2d";
import PhysicsContext from "./PhysicsContext";
import { collisionFilter } from "../tools/flags";

interface Props {
  offset: number;
  autostep?: {
    maxHeight: number;
    minWidth: number;
  };
  collisionGroup?: number;
  collisionMask?: number;
}

interface CharacterCollisionItem extends CharacterCollision {
  userData: any;
  sendMessage: (msg: any) => void;
}

interface Controller {
  id: string;
  computeColliderMovement: (
    m: Vector,
    opts?: {
      collisionGroup?: number;
      collisionMask?: number;
    }
  ) => {
    movement: Vector;
    collisions: CharacterCollisionItem[];
    closestCollision: CharacterCollisionItem | null;
  };
  contactCollider: (c: Collider, prediction: number) => ShapeContact | null;
}

export default function useCharacterController({
  offset,
  autostep,
  collisionGroup,
  collisionMask,
}: Props): Controller {
  const id = useMemo(() => Math.random().toString(36).slice(-6), []);

  const physicsCtx = useContext(PhysicsContext);

  const controller = useMemo(() => {
    const controller = physicsCtx.createCharacterController(offset);
    controller.setUp(physicsCtx.upVector);
    if (autostep) {
      const { maxHeight, minWidth } = autostep;
      controller.enableAutostep(maxHeight, minWidth, false);
    }
    return controller;
  }, []);

  useEffect(() => {
    return () => {
      physicsCtx.removeCharacterController(controller);
      controller.free();
    };
  }, []);

  function contactCollider(c: Collider, prediction: number) {
    const coliderHandle = physicsCtx.controllerColliderMap.get(id);
    if (typeof coliderHandle !== "undefined") {
      const collider = physicsCtx.getCollider(coliderHandle);
      if (collider) {
        return collider.contactCollider(c, prediction);
      }
    }
    return null;
  }

  function computeColliderMovement(
    movement: Vector,
    opts?: {
      collisionGroup?: number;
      collisionMask?: number;
    }
  ) {
    const coliderHandle = physicsCtx.controllerColliderMap.get(id);
    if (typeof coliderHandle !== "undefined") {
      const collider = physicsCtx.getCollider(coliderHandle);
      if (collider) {
        const cg = opts?.collisionGroup ?? collisionGroup;
        const cm = opts?.collisionMask ?? collisionMask;
        const filter = collisionFilter(cg, cm);

        controller!.computeColliderMovement(
          collider,
          movement,
          undefined,
          filter
        );

        const m = controller!.computedMovement();
        const collisions: CharacterCollisionItem[] = [];

        let closestCollision = null;
        let minToi = Infinity;

        let normX = 0;
        let normY = 0;

        for (let i = 0; i < controller!.numComputedCollisions(); i++) {
          const col = controller!.computedCollision(i)!;
          const userData = physicsCtx.getUserData(col.collider!.handle);

          if (Math.abs(col.normal1.x) > normX) {
            normX = col.normal1.x;
          }

          if (Math.abs(col.normal1.y) > normY) {
            normY = col.normal1.y;
          }

          collisions.push({
            ...col,
            userData,
            sendMessage: (msg: any) => {
              physicsCtx.colliderLisetenerMap.get(col.collider!.handle)?.(msg);
            },
          });

          if (col.toi < minToi) {
            minToi = col.toi;
            closestCollision = collisions[collisions.length - 1];
          }
        }

        // fix ghost collision
        if (Math.abs(movement.x) > 0 && m.x === 0) {
          if (Math.abs(normX) < 0.01) {
            m.x = movement.x;
          }
        }

        //fix ghost collision
        if (Math.abs(movement.y) > 0 && m.y === 0) {
          if (Math.abs(normY) < 0.01) {
            m.y = movement.y;
          }
        }

        return {
          movement: m,
          collisions,
          closestCollision,
        };
      }
    }

    return {
      movement: { x: 0, y: 0 },
      collisions: [],
      closestCollision: null,
    };
  }

  return {
    id,
    computeColliderMovement,
    contactCollider,
  };
}
