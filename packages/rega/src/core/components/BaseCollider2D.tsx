import React, { useContext, useEffect, useMemo } from "react";
import RigidBodyContext from "../primitives/RigidBodyContext";
import Rapier, { Collider, ActiveCollisionTypes } from "@dimforge/rapier2d";
import PhysicsContext, {
  CollisionItem,
  EventMapItem,
} from "../primitives/PhysicsContext";
import useAnchor, { AnchorType } from "../hooks/useAnchor";
import TransformContext from "../primitives/TransformContext";
import { matrixToTransform } from "../math/transform";
import { collisionFilter } from "../tools/flags";

export { ActiveCollisionTypes };

export interface BaseCollider2DProps {
  collider: Collider;
  sensor?: boolean;
  anchor?: AnchorType;
  anchorSize: [number, number];
  friction?: number;
  restitution?: number;
  collisionGroup?: number;
  collisionMask?: number;
  activeCollisionTypes?: ActiveCollisionTypes;
  onCollisionChange?: (item: CollisionItem<any>[]) => void;
  onMessage?: (msg: any) => void;
  modifySolverContacts?: (
    normal: [number, number],
    point1: [number, number]
  ) => boolean;
  userData?: any;
  characterControllerId?: string;
}

export default React.memo(function BaseCollider2D({
  collider,
  anchor = "center",
  anchorSize,
  sensor = false,
  friction,
  restitution,
  collisionGroup,
  collisionMask,
  activeCollisionTypes = ActiveCollisionTypes.DEFAULT |
    ActiveCollisionTypes.KINEMATIC_FIXED,
  onCollisionChange,
  onMessage,
  modifySolverContacts,
  userData,
  characterControllerId,
}: BaseCollider2DProps) {
  const eventMap = useMemo(() => ({} as EventMapItem), []);

  const physicsCtx = useContext(PhysicsContext);

  const rbCtx = useContext(RigidBodyContext);

  const transform = useContext(TransformContext);

  const anchorMatrix = useAnchor(anchor, anchorSize);

  useEffect(() => {
    if (rbCtx) {
      const mat = anchorMatrix.clone().multiply(transform.relativeMatrix);
      const { translation: t, rotation: r } = matrixToTransform(mat);
      collider.setTranslationWrtParent({ x: t.x, y: t.y });
      collider.setRotationWrtParent(r.z);
    } else {
      const mat = anchorMatrix.clone().multiply(transform.leafMatrix);
      const { translation: t, rotation: r } = matrixToTransform(mat);
      collider.setTranslation({ x: t.x, y: t.y });
      collider.setRotation(r.z);
    }
  }, [transform, anchorMatrix, collider]);

  useEffect(() => {
    collider.setSensor(sensor);
  }, [sensor, collider]);

  useEffect(() => {
    if (friction !== undefined) {
      collider.setFriction(friction);
      collider.setFrictionCombineRule(Rapier.CoefficientCombineRule.Multiply);
    }
  }, [friction, collider]);

  useEffect(() => {
    collider.setCollisionGroups(collisionFilter(collisionGroup, collisionMask));
  }, [collisionGroup, collisionMask, collider]);

  useEffect(() => {
    if (restitution !== undefined) {
      collider.setRestitution(restitution);
      collider.setRestitutionCombineRule(
        Rapier.CoefficientCombineRule.Multiply
      );
    }
  }, [restitution, collider]);

  useEffect(() => {
    collider.setActiveCollisionTypes(
      activeCollisionTypes || ActiveCollisionTypes.DEFAULT
    );
  }, [activeCollisionTypes, collider]);

  useEffect(() => {
    eventMap.onCollisionChange = onCollisionChange;
    if (onCollisionChange) {
      collider.setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS);
    } else {
      collider.setActiveEvents(Rapier.ActiveEvents.NONE);
    }
  }, [onCollisionChange, collider]);

  useEffect(() => {
    if (onMessage) {
      physicsCtx.colliderLisetenerMap.set(collider.handle, onMessage);
    }
    return () => {
      physicsCtx.colliderLisetenerMap.delete(collider.handle);
    };
  }, [onMessage, collider]);

  useEffect(() => {
    eventMap.modifySolverContacts = modifySolverContacts;
    if (modifySolverContacts) {
      collider.setActiveHooks(Rapier.ActiveHooks.MODIFY_SOLVER_CONTACTS);
    } else {
      collider.setActiveHooks(Rapier.ActiveHooks.NONE);
    }
  }, [modifySolverContacts, collider]);

  useEffect(() => {
    eventMap.getUserData = () => userData;
  }, [userData]);

  useEffect(() => {
    if (characterControllerId) {
      physicsCtx.controllerColliderMap.set(
        characterControllerId,
        collider.handle
      );
      return () => {
        if (
          physicsCtx.controllerColliderMap.get(characterControllerId) ===
          collider.handle
        ) {
          physicsCtx.controllerColliderMap.delete(characterControllerId);
        }
      };
    }
  }, [characterControllerId, collider]);

  useEffect(() => {
    physicsCtx.eventMap.set(collider.handle, eventMap);
    return () => {
      physicsCtx.eventMap.delete(collider.handle);
    };
  }, [collider]);

  return null;
});
