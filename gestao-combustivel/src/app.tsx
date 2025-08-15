
import type react from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/dashboard";
import Motorista from "./Pages/motorista";
import Login from "./Pages/login";
import Sidebar from "./components/sidebar";

function Private({ children }: { children: react.JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Shell() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="motorista" element={<Motorista />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<Private><Shell /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
function useAuth(): { isAuthenticated: any; } {
  throw new Error("Function not implemented.");
}

