import React, { useEffect, useContext, useMemo } from "react";
import SceneContext from "./SceneContext";
import ThreeContext from "./ThreeContext";
import TransformContext from "./TransformContext";
import OrderContext from "./OrderContext";
import { BufferGeometry, Mesh as TMesh, MeshBasicMaterial } from "three/webgpu";

interface Props {
  geometry: BufferGeometry;
  material: MeshBasicMaterial;
  order?: number;
}

export default React.memo(function Mesh({ geometry, material, order }: Props) {
  const ctx = useContext(ThreeContext);
  const scene = useContext(SceneContext);
  const orderCtx = useContext(OrderContext);

  const transform = useContext(TransformContext);

  const mesh = useMemo(() => new TMesh(geometry, material), []);

  useEffect(() => {
    // @ts-ignore
    mesh.position.set(0, 0, 0);
    // @ts-ignore
    mesh.rotation.set(0, 0, 0);
    // @ts-ignore
    mesh.quaternion.set(0, 0, 0, 1);
    // @ts-ignore
    mesh.scale.set(1, 1, 1);

    mesh.applyMatrix4(transform.leafMatrix);
  }, [transform]);

  useEffect(() => {
    mesh.renderOrder = order ?? orderCtx.order;
  }, [orderCtx, order]);

  useEffect(() => {
    mesh.geometry = geometry;
  }, [geometry]);

  useEffect(() => {
    mesh.material = material;
  }, [material]);

  useEffect(() => {
    if (scene === "world") {
      ctx.scene.add(mesh);
    } else if (scene === "gui") {
      ctx.guiScene.add(mesh);
    }
    mesh.frustumCulled = false;
    return () => {
      if (scene === "world") {
        ctx.scene.remove(mesh);
      } else if (scene === "gui") {
        ctx.guiScene.remove(mesh);
      }
      mesh.material.dispose();
      mesh.geometry.dispose();
    };
  }, []);

  return null;
});
