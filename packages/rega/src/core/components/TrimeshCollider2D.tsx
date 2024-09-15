import React, { useContext, useEffect, useMemo } from "react";
import PhysicsContext from "../primitives/PhysicsContext";
import BaseCollider2D from "./BaseCollider2D";
import RigidBodyContext from "../primitives/RigidBodyContext";
import { ColliderDesc, TriMeshFlags } from "@dimforge/rapier2d";

interface Props {
  vertices: number[];
  indices: number[] | Uint32Array;
  sensor?: boolean;
}

export default React.memo(function TrimeshCollider2D({
  vertices,
  indices,
  sensor = false,
}: Props) {
  const ctx = useContext(PhysicsContext);

  const rbCtx = useContext(RigidBodyContext);

  const collider = useMemo(() => {
    const desc = ColliderDesc.trimesh(
      new Float32Array(vertices),
      new Uint32Array(indices),
      TriMeshFlags.FIX_INTERNAL_EDGES
    );
    return ctx.createCollider(desc, { rigidBody: rbCtx.rigidBody });
  }, []);

  useEffect(() => {
    collider.setSensor(sensor);
  }, [sensor]);

  useEffect(() => {
    return () => {
      ctx.removeCollider(collider);
    };
  }, [collider]);

  return (
    <BaseCollider2D collider={collider} sensor={sensor} anchorSize={[0, 0]} />
  );
});
