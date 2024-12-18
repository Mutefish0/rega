import React, { useEffect, useRef } from "react";
import Engine from "rega/web";
import App from "./App";

export default function () {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const instance = Engine(<App />, {
      width: 512,
      height: 512,
      outputColorSpace: "srgb-linear",
      canvas: canvasRef.current!,
    });
    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <div>
      <h1>font rendering</h1>
      <canvas ref={canvasRef} />
    </div>
  );
}
