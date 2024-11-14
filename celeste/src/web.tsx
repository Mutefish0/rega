import React from "react";
import Engine from "rega/web";
import App from "./App.tsx";
import "./index.css";

Engine(<App />, {
  width: 512,
  height: 512,
  backgroundColor: "#000",
});
