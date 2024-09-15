import { useState, useContext } from "react";
import ThreeContext from "../primitives/ThreeContext";

export interface Particle<T> {
  id: string;
  data: T;
  lifetime: number;
  createdAt: number;
}

type EmitOptions<T> = T extends void
  ? { lifetime: number }
  : { data: T; lifetime: number };

export default function useParticles<T extends any>() {
  const ctx = useContext(ThreeContext);

  const [list, setList] = useState<Particle<T>[]>([]);
  function emit(opts: EmitOptions<T>) {
    const id = Math.random().toString(36).slice(-6);
    const particle = {
      id,
      lifetime: opts.lifetime,
      // @ts-ignore
      data: opts.data,
      createdAt: ctx.now,
    };
    setList((l) => [...l, particle]);
    setTimeout(() => {
      setList((l) => l.filter((p) => p.id !== id));
    }, opts.lifetime);
    return particle;
  }
  return { list, emit };
}
