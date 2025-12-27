import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardHome from "@/pages/DashboardHome";
import GenerateTryon from "@/pages/GenerateTryon";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import ApiPlayground from "@/pages/ApiPlayground";
import Docs from "@/pages/Docs";
import Webhooks from "@/pages/Webhooks";
import Usage from "@/pages/Usage";
import PurchaseCredits from "@/pages/PurchaseCredits";
import PurchaseSuccess from "@/pages/PurchaseSuccess";
import Billing from "@/pages/Billing";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/purchase-credits"
            element={
              <ProtectedRoute>
                <PurchaseCredits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-success"
            element={
              <ProtectedRoute>
                <PurchaseSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="generate" element={<GenerateTryon />} />
            <Route path="history" element={<History />} />
            <Route path="api-playground" element={<ApiPlayground />} />
            <Route path="docs" element={<Docs />} />
            <Route path="webhooks" element={<Webhooks />} />
            <Route path="usage" element={<Usage />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
