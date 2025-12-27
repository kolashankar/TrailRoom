import React, { lazy, Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";

// Eager load critical components
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import DashboardLayout from "@/layouts/DashboardLayout";

// Lazy load dashboard pages for code splitting
const DashboardHome = lazy(() => import("@/pages/DashboardHome"));
const GenerateTryon = lazy(() => import("@/pages/GenerateTryon"));
const History = lazy(() => import("@/pages/History"));
const Settings = lazy(() => import("@/pages/Settings"));
const ApiPlayground = lazy(() => import("@/pages/ApiPlayground"));
const Docs = lazy(() => import("@/pages/Docs"));
const Webhooks = lazy(() => import("@/pages/Webhooks"));
const Usage = lazy(() => import("@/pages/Usage"));
const PurchaseCredits = lazy(() => import("@/pages/PurchaseCredits"));
const PurchaseSuccess = lazy(() => import("@/pages/PurchaseSuccess"));
const Billing = lazy(() => import("@/pages/Billing"));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
