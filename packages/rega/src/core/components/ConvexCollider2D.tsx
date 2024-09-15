import React, { useContext, useEffect, useMemo } from "react";
import PhysicsContext from "../primitives/PhysicsContext";
import BaseCollider2D from "./BaseCollider2D";
import RigidBodyContext from "../primitives/RigidBodyContext";
import { ColliderDesc } from "@dimforge/rapier2d";

interface Props {
  points: [number, number][];
  sensor?: boolean;
  // convex-polyline 不会计算凸包，而是直接使用传入的点，如果不满足的话，会导致碰撞体无效
  type: "convex-hull" | "convex-polyline" | "polyline" | "convex-decomposition";
  userData?: any;
  modifySolverContacts?: (
    normal: [number, number],
    point1: [number, number]
  ) => boolean;
  collisionGroup?: number;
  collisionMask?: number;
}

export default React.memo(function ConvexCollider2D({
  points,
  sensor = false,
  type,
  userData,
  modifySolverContacts,
  collisionGroup,
  collisionMask,
}: Props) {
  const ctx = useContext(PhysicsContext);
  const rbCtx = useContext(RigidBodyContext);

  const desc = useMemo(() => {
    const indices: Array<[number, number]> = [];
    if (type === "convex-decomposition") {
      for (let i = 0; i < points.length - 1; i++) {
        indices.push([i, i + 1]);
      }
    }
    const desc =
      type === "polyline"
        ? ColliderDesc.polyline(new Float32Array(points.flat()))!
        : type === "convex-polyline"
        ? ColliderDesc.convexPolyline(new Float32Array(points.flat()))!
        : type === "convex-decomposition"
        ? ColliderDesc.convexDecomposition(
            new Float32Array(points.flat()),
            new Uint32Array(indices.flat())
          )
        : ColliderDesc.convexHull(new Float32Array(points.flat()))!;
    return desc;
  }, [points]);

  const collider = useMemo(() => {
    return ctx.createCollider(desc, rbCtx?.rigidBody);
  }, []);

  useEffect(() => {
    collider.setShape(desc.shape);
    collider.setMassProperties(
      desc.mass,
      desc.centerOfMass,
      desc.principalAngularInertia
    );
  }, [desc]);

  useEffect(() => {
    return () => {
      ctx.removeCollider(collider);
    };
  }, [collider]);

  return (
    <BaseCollider2D
      collider={collider}
      sensor={sensor}
      collisionGroup={collisionGroup}
      collisionMask={collisionMask}
      anchorSize={[0, 0]}
      modifySolverContacts={modifySolverContacts}
      userData={userData}
    />
  );
});
