import { Outlet, Link } from "react-router";

function App() {
  return (
    <>
      <div>
        <div>
          <Link className="nav-link" to="/msdf-font">
            MSDF Font
          </Link>
          <Link className="nav-link" to="/pageB">
            Page B
          </Link>
        </div>
        <Outlet />
      </div>
    </>
  );
}

export default App;
