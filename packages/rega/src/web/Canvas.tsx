import React, { useEffect, useRef } from "react";
import { EngineConfig } from "../core/components/Engine";
import Engine from "rega/web";

interface Props extends Omit<EngineConfig, "canvas"> {
  App: React.ComponentType;
}

export default function Canvas({ App, ...rest }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const instance = Engine(<App />, {
      canvas: canvasRef.current!,
      ...rest,
    });
    return () => {
      instance.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} />;
}
