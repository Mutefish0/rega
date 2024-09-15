import React, { useContext, useEffect, useMemo } from "react";
import RigidBodyContext from "../primitives/RigidBodyContext";
import PhysicsContext, { CollisionItem } from "../primitives/PhysicsContext";
import Rapier, { ColliderDesc } from "@dimforge/rapier2d";
import { AnchorType } from "../hooks/useAnchor";
import BaseCollider2D, { ActiveCollisionTypes } from "./BaseCollider2D";

interface Props<T> {
  size: [number, number] | [number, number, number];
  sensor?: boolean;
  shape: "round-cuboid" | "cuboid" | "capsule" | "ball";
  anchor?: AnchorType;
  friction?: number;
  restitution?: number;
  userData?: T;
  onCollisionChange?: (item: CollisionItem<any>[]) => void;
  onMessage?: (msg: any) => void;
  collisionGroup?: number;
  collisionMask?: number;
  activeCollisionTypes?: ActiveCollisionTypes;
  characterControllerId?: string;
}

export default React.memo(function ShapeCollider2D<T extends any>({
  size,
  sensor = false,
  shape,
  anchor = "center",
  friction,
  restitution,
  userData,
  onCollisionChange,
  onMessage,
  collisionGroup,
  collisionMask,
  activeCollisionTypes,
  characterControllerId,
}: Props<T>) {
  const anchorSize = useMemo(() => {
    if (shape === "round-cuboid") {
      const borderRadius = size[2] || 0;
      return [size[0] + borderRadius * 2, size[1] + borderRadius * 2] as [
        number,
        number
      ];
    } else if (shape === "capsule") {
      let [w, h] = size;
      h = Math.max(w, h);
      return [w, h + w] as [number, number];
    }
    return size as [number, number];
  }, [size.join(","), shape]);

  const ctx = useContext(PhysicsContext);

  const rbCtx = useContext(RigidBodyContext);

  const collider = useMemo(() => {
    const desc =
      shape === "capsule"
        ? ColliderDesc.capsule(size[1] / 2, size[0] / 2)
        : shape === "ball"
        ? ColliderDesc.ball(size[0] / 2)
        : shape === "round-cuboid"
        ? ColliderDesc.roundCuboid(size[0] / 2, size[1] / 2, size[2] || 0)
        : ColliderDesc.cuboid(size[0] / 2, size[1] / 2);

    return ctx.createCollider(desc, rbCtx?.rigidBody);
  }, []);

  useEffect(() => {
    if (collider.shape.type === Rapier.ShapeType.Cuboid) {
      collider.setHalfExtents(new Rapier.Vector2(size[0] / 2, size[1] / 2));
    } else if (collider.shape.type === Rapier.ShapeType.Capsule) {
      collider.setRadius(size[0] / 2);
      collider.setHalfHeight(size[1] / 2);
    } else if (collider.shape.type === Rapier.ShapeType.Ball) {
      collider.setRadius(size[0] / 2);
    }
  }, [size.join(",")]);

  useEffect(() => {
    if (shape === "ball" && collider.shape.type !== Rapier.ShapeType.Ball) {
      collider.setShape(new Rapier.Ball(size[0] / 2));
    } else if (
      shape === "capsule" &&
      collider.shape.type !== Rapier.ShapeType.Capsule
    ) {
      collider.setShape(new Rapier.Capsule(size[1] / 2, size[0] / 2));
    } else if (
      shape === "cuboid" &&
      collider.shape.type !== Rapier.ShapeType.Cuboid
    ) {
      collider.setShape(new Rapier.Cuboid(size[0] / 2, size[1] / 2));
    } else if (
      shape === "round-cuboid" &&
      collider.shape.type !== Rapier.ShapeType.RoundCuboid
    ) {
      collider.setShape(
        new Rapier.RoundCuboid(size[0] / 2, size[1] / 2, size[2] || 0)
      );
    }
  }, [shape, size.join(",")]);

  useEffect(() => {
    return () => {
      ctx.removeCollider(collider);
    };
  }, [collider]);

  return (
    <BaseCollider2D
      anchorSize={anchorSize}
      anchor={anchor}
      collider={collider}
      sensor={sensor}
      restitution={restitution}
      collisionGroup={collisionGroup}
      collisionMask={collisionMask}
      friction={friction}
      activeCollisionTypes={activeCollisionTypes}
      onCollisionChange={onCollisionChange}
      onMessage={onMessage}
      userData={userData}
      characterControllerId={characterControllerId}
    />
  );
});
