import React from "react";
import Engine from "rega/deno";
import App from "./App.tsx";

Engine(<App />, {
  width: 512,
  height: 512,
  outputColorSpace: "srgb-linear",
  title: "deno celeste",
});
