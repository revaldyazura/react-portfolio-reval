import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Home     from "./pages/home/Home";
import Projects from "./pages/projects/Projects";
import Login    from "./pages/login/Login";
import Admin    from "./pages/admin/Admin";

// Protects /admin — redirects to /login if not authenticated
const RequireAuth = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/login"   element={<Login />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Admin />
            </RequireAuth>
          }
        />
        {/* catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;