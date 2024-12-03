import { Outlet, Link } from "react-router";

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
        </div>
        <Outlet />
      </div>
    </>
  );
}

export default App;
