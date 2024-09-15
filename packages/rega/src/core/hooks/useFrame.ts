import { useContext, useEffect } from "react";
import ThreeContext from "../primitives/ThreeContext";

export type FrameCallback = (deltaTime: number, time: number) => void;

export default function useFrame(cb: FrameCallback, deps: any[] = []) {
  const ctx = useContext(ThreeContext);
  useEffect(() => {
    ctx.frameCallbacks.add(cb);
    return () => {
      ctx.removedCallbacks.add(cb);
    };
  }, deps);
}
