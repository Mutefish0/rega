import { useContext, useEffect, useMemo, useRef } from "react";
import TransformContext from "./TransformContext";
import RenderContext from "./RenderContext";
import { RenderGroupContext } from "./RenderGroup";
import { MaterialJSON, TransferInput } from "../render";
import { BindingContext } from "./BindingContext";

import { createUniformBinding } from "../../core/render/binding";

import { differenceBy } from "lodash";

interface Props {
  material: MaterialJSON;
  input: TransferInput;
}

export default function RenderObject({ material, input }: Props) {
  const id = useMemo(() => crypto.randomUUID(), []);
  const rgCtx = useContext(RenderGroupContext);
  const renderCtx = useContext(RenderContext);
  const transform = useContext(TransformContext);
  const bindingCtx = useContext(BindingContext);
  const refTargets = useRef({
    targetIds: [] as string[],
  });

  const bModelWorldMatrix = useMemo(() => createUniformBinding("mat4"), []);

  useEffect(() => {
    const mat = transform.leafMatrix;
    bModelWorldMatrix.update(mat.elements);
  }, [transform]);

  useEffect(() => {
    renderCtx.server.createObject({
      id,
      material,
      bindings: {
        ...bindingCtx,
        modelWorldMatrix: bModelWorldMatrix.resource,
      },
      renderTargetBindGroupLayout: renderCtx.renderTargetBindGroupLayout,
      input,
    });
    return () => {
      renderCtx.server.removeObject(id);
    };
  }, []);

  useEffect(() => {
    const prevIds = refTargets.current.targetIds;
    const currentIds = rgCtx.targetIds;
    const addedIds = differenceBy(currentIds, prevIds);
    const removedIds = differenceBy(prevIds, currentIds);
    removedIds.forEach((targetId) => {
      renderCtx.server.removeObjectFromTarget(targetId, id);
    });
    addedIds.forEach((targetId) => {
      renderCtx.server.addObjectToTarget(targetId, id);
    });
    refTargets.current.targetIds = rgCtx.targetIds;
  }, [rgCtx]);

  return null;
}
