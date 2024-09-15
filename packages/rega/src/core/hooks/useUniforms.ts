import { useEffect, useMemo } from "react";
import { IUniform } from "three/webgpu";

type GetType<T> = {
  [K in keyof T]: T[K] extends { value: infer V } ? V : never;
};

export default function useUniforms<T extends Record<string, IUniform>>(
  defaultUniforms: T,
  updater: () => Partial<GetType<T>>,
  deps: any[] = []
) {
  const uniforms = useMemo(() => defaultUniforms, []);
  useEffect(() => {
    const updates = updater();
    for (const key in updates) {
      uniforms[key].value = updates[key];
    }
  }, deps);
  return uniforms;
}
