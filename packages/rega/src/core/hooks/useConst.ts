import { useMemo } from "react";

export default function useConst<T>(d: T): T {
  return useMemo(() => d, []);
}
