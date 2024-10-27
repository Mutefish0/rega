import { useContext, useEffect, useMemo } from "react";
import ThreeContext from "./ThreeContext";
import { MaterialJSON, TransferBinding, TransferInput } from "../render";

interface Props {
  material: MaterialJSON;
  bindings: TransferBinding[];
  input: TransferInput;
}

export default function RenderObject({ material, bindings, input }: Props) {
  const id = useMemo(() => Math.random().toString(36).slice(-8), []);
  const ctx = useContext(ThreeContext);
  useEffect(() => {
    ctx.renderServer.addObject({
      id,
      material,
      bindings,
      input,
    });
    return () => {
      ctx.renderServer.removeObject(id);
    };
  }, []);
  return null;
}
