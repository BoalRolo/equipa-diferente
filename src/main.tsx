import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import JsonGenerator from "./JsonGenerator";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/json-step-builder">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/json-generator" element={<JsonGenerator />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
