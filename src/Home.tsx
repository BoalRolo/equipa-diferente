
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Arial", textAlign: "center", padding: "4rem" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Equipa Diferente
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        Escolhe a ferramenta que queres usar
      </p>
      <button
        onClick={() => navigate("/json-generator")}
        style={{
          fontSize: "1rem",
          padding: "1rem 2rem",
          backgroundColor: "#1f6feb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        JSON Step Generator
      </button>
    </div>
  );
};

export default Home;
