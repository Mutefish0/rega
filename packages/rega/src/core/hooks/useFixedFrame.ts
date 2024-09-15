import { useContext } from "react";
import ThreeContext from "../primitives/ThreeContext";
import useFrame, { FrameCallback } from "./useFrame";
import useConst from "./useConst";

export default function useFixedFrame(
  cb: FrameCallback,
  deps: any[] = [],
  fixedTimestep?: number
) {
  const s = useConst({ time: 0 });
  const ctx = useContext(ThreeContext);
  const dt = fixedTimestep || ctx.fixedTimestep;
  return useFrame(
    (_, time) => {
      if (s.time === 0) {
        s.time = time;
      }
      while (s.time <= time) {
        cb(dt, s.time);
        s.time += dt;
      }
    },
    [dt, ...deps]
  );
}
