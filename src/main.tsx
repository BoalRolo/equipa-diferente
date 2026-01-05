import React from "react";
import "./styles/index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import NifGenerator from "./pages/NifGenerator";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import FunctionNumber from "./pages/FunctionNumber";
import ImportEvidence from "./pages/ImportEvidence";
import { DarkModeProvider } from "./contexts/DarkModeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DarkModeProvider>
      <BrowserRouter basename="/equipa-diferente">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nif-generator"
            element={
              <ProtectedRoute>
                <NifGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/function-number"
            element={
              <ProtectedRoute>
                <FunctionNumber />
              </ProtectedRoute>
            }
          />
          <Route
            path="/import-evidence"
            element={
              <ProtectedRoute>
                <ImportEvidence />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  </React.StrictMode>
);
