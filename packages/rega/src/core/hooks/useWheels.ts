import { useEffect, useContext } from "react";
import ThreeContext from "../primitives/ThreeContext";

interface Options {
  ctrlKey: boolean;
}

export default function useWheels(
  cb: (dx: number, dy: number, opts: Options) => void
) {
  const ctx = useContext(ThreeContext);

  function handleWheels(e: WheelEvent) {
    const { deltaX, deltaY } = e;

    const dx = deltaX / (ctx.size[0] / ctx.pixelRatio);
    const dy = deltaY / (ctx.size[1] / ctx.pixelRatio);
    cb(dx, dy, {
      ctrlKey: e.ctrlKey,
    });

    e.preventDefault();
  }

  useEffect(() => {
    // web
    // @ts-ignore
    if (typeof Deno === "undefined") {
      document.addEventListener("wheel", handleWheels, { passive: false });
      return () => document.removeEventListener("wheel", handleWheels);
    }
  }, []);
}
