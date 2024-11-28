import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App.tsx";
import MSDFFont from "./pages/MSDFFont";
import PageB from "./pages/PageB";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="msdf-font" element={<MSDFFont />} />
        <Route path="pageB" element={<PageB />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
