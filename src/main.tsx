import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import JsonGenerator from "./JsonGenerator";
import NifGenerator from "./NifGenerator";
import CodigoDepreciado from "./CodigoDepreciado";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
              <CodigoDepreciado />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
