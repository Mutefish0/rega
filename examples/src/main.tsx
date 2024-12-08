import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router";
import "./index.css";
import MSDFFont from "./pages/MSDFFont";
import LayoutExample from "./pages/Layout";
import Cube from "./pages/Cube";

function App() {
  return (
    <>
      <div>
        <div>
          <Link className="nav-link" to="/msdf-font">
            Font rendering example
          </Link>
          <Link className="nav-link" to="/layout">
            Layout example
          </Link>
          <Link className="nav-link" to="/cube">
            Cube example
          </Link>
        </div>
        <Outlet />
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="msdf-font" element={<MSDFFont />} />
        <Route path="layout" element={<LayoutExample />} />
        <Route path="cube" element={<Cube />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
