import { useEffect, useContext, useRef } from "react";
import TransformContext from "../primitives/TransformContext";
import { Matrix4 } from "pure3";

const emptyMatrix = new Matrix4();

export default function useAirTag() {
  const ref = useRef<{ matrix: Matrix4 }>({ matrix: emptyMatrix });

  const tag = <Tag onChange={(mat) => (ref.current.matrix = mat)} />;

  return [tag, ref.current!] as const;
}

function Tag({ onChange }: { onChange: (value: Matrix4) => void }) {
  const ctx = useContext(TransformContext);

  useEffect(() => {
    onChange(ctx.leafMatrix);
  }, [ctx]);

  return null;
}
