import React, { useContext, useEffect, useMemo } from "react";
import PhysicsContext from "../primitives/PhysicsContext";
import BaseCollider2D from "./BaseCollider2D";
import RigidBodyContext from "../primitives/RigidBodyContext";
import { ColliderDesc, Shape } from "@dimforge/rapier2d";

interface Props {
  shapes: Shape[];
  positions: [number, number][];
}

export default React.memo(function CompoundCollider2D({
  shapes,
  positions,
}: Props) {
  const ctx = useContext(PhysicsContext);
  const rbCtx = useContext(RigidBodyContext);

  const collider = useMemo(() => {
    const desc = ColliderDesc.compound(shapes, positions);
    return ctx.createCollider(desc, { rigidBody: rbCtx.rigidBody });
  }, []);

  useEffect(() => {
    return () => {
      ctx.removeCollider(collider);
    };
  }, [collider]);

  return <BaseCollider2D collider={collider} anchorSize={[0, 0]} />;
});
