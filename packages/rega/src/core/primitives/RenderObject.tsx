import { useContext, useEffect, useMemo, useRef } from "react";
import ThreeContext from "./ThreeContext";
import TransformContext from "./TransformContext";
import RenderContext from "./RenderContext";
import { RenderGroupContext } from "./RenderGroup";
import { MaterialJSON, TransferInput, BindingHandle } from "../render";

import { differenceBy } from "lodash";

interface Props {
  material: MaterialJSON;
  bindingHandle: BindingHandle;
  input: TransferInput;
}

export default function RenderObject({
  material,
  bindingHandle,
  input,
}: Props) {
  const id = useMemo(() => crypto.randomUUID(), []);
  const ctx = useContext(ThreeContext);
  const rgCtx = useContext(RenderGroupContext);
  const renderCtx = useContext(RenderContext);
  const transform = useContext(TransformContext);
  const refTargets = useRef({
    targetIds: [] as string[],
  });

  useEffect(() => {
    const mat = transform.leafMatrix;
    bindingHandle.update("modelWorldMatrix", mat.elements)!;
  }, [transform]);

  useEffect(() => {
    renderCtx.server.createObject({
      id,
      material,
      bindings: bindingHandle.transferBindings,
      input,
      viewport: [0, 0, ctx.size[0], ctx.size[1]],
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
