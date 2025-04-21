import React from "react";
import "./styles/index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import JsonGenerator from "./pages/JsonGenerator";
import NifGenerator from "./pages/NifGenerator";
import DepreciatedCode from "./pages/DepreciatedCode";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import FunctionNumber from "./pages/FunctionNumber";
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
            path="/json-generator"
            element={
              <ProtectedRoute>
                <JsonGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/codigo-depreciado"
            element={
              <ProtectedRoute>
                <DepreciatedCode />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  </React.StrictMode>
);
