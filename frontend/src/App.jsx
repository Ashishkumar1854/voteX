// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LoginPage from "./pages/auth/LoginPage";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import OrgAdminDashboard from "./pages/orgadmin/OrgAdminDashboard";
import StudentVotingPage from "./pages/student/StudentVotingPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user } = useSelector((state) => state.auth);

  // Home route → based on role, auto redirect
  const getHomeRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "SUPER_ADMIN")
      return <Navigate to="/super-admin" replace />;
    if (user.role === "ORG_ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "STUDENT") return <Navigate to="/vote" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ORG_ADMIN"]}>
              <OrgAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vote"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentVotingPage />
            </ProtectedRoute>
          }
        />

        {/* default home */}
        <Route path="/" element={getHomeRedirect()} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
