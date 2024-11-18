import { useMemo } from "react";
import { TransferResource, UniformType } from "../render";
import { createUniformBindingView } from "../../core/render/binding";

export default function useBindingView(
  type: UniformType,
  binding: TransferResource
) {
  const view = useMemo(() => {
    return createUniformBindingView(binding, type);
  }, [binding, type]);
  return view;
}
