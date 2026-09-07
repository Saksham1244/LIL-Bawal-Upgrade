import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes";

function App() {
  const location = useLocation();
  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]);
  return <AppRoutes />;
}

export default App;
