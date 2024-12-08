import React, { useEffect, useRef } from "react";
import { EngineConfig } from "../core/components/Engine";
import Engine from "rega/web";

interface Props extends Omit<EngineConfig, "canvas"> {
  children: React.ReactNode;
}

export default function Canvas({ children, ...rest }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const instance = Engine(children, {
      canvas: canvasRef.current!,
      ...rest,
    });
    return () => {
      instance.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} />;
}
