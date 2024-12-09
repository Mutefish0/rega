import { useMemo } from "react";
import { TransferResource, UniformType } from "../render";
import {
  createUniformBindingView,
  BindingUpdater,
  BindingsLayout,
} from "../render/binding";

export default function useBindingViews<T extends BindingsLayout>(
  obj: T,
  resources: Record<string, TransferResource>
): {
  [K in keyof T]: BindingUpdater<T[K] extends UniformType ? T[K] : never>;
} {
  return useMemo(() => {
    const updates = {} as {
      [K in keyof T]: BindingUpdater<T[K] extends UniformType ? T[K] : never>;
    };

    for (const name in obj) {
      const h = createUniformBindingView(resources[name], obj[name]);
      updates[name] = h.update;
    }

    return updates;
  }, []);
}
