import { createContext } from "react";

export function createContextValues({ paused }: { paused: boolean }) {
  return {
    paused,
  };
}

export default createContext<ReturnType<typeof createContextValues>>({
  paused: false,
});
