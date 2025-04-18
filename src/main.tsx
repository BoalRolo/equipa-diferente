import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import JsonGenerator from "./JsonGenerator";
import NifGenerator from "./NifGenerator";
import CodigoDepreciado from "./CodigoDepreciado";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/json-step-builder">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/json-generator" element={<JsonGenerator />} />
        <Route path="/codigo-depreciado" element={<CodigoDepreciado />} />
        <Route path="/nif-generator" element={<NifGenerator />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
