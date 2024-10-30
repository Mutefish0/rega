import { useContext, useEffect, useMemo } from "react";
import ThreeContext from "./ThreeContext";
import TransformContext from "./TransformContext";
import { MaterialJSON, TransferInput, BindingHandle } from "../render";

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
  const id = useMemo(() => Math.random().toString(36).slice(-8), []);
  const ctx = useContext(ThreeContext);
  const transform = useContext(TransformContext);

  useEffect(() => {
    const mat = transform.leafMatrix;
    bindingHandle.update("worldMatrix", mat.elements)!;
  }, [transform]);

  useEffect(() => {
    ctx.renderServer.addObject({
      id,
      material,
      bindings: bindingHandle.transferBindings,
      input,
    });
    return () => {
      ctx.renderServer.removeObject(id);
    };
  }, []);
  return null;
}
