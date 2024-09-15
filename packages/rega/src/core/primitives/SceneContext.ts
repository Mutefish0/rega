import { createContext } from "react";

type SceneType = "world" | "gui";

export default createContext<SceneType>("world");
