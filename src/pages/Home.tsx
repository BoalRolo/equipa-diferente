import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import Header from "../components/Header";

interface Tool {
  name: string;
  description: string;
  path: string;
}

interface User {
  name: string;
}

const tools: Tool[] = [
  {
    name: "JSON Step Generator",
    description: "Gerador de passos JSON",
    path: "/json-generator",
  },
  {
    name: "Gerador de Código Depreciado",
    description: "Obter codigo depreciado",
    path: "/codigo-depreciado",
  },
  {
    name: "Gerador de NIF",
    description: "Gerador de número de identificação fiscal",
    path: "/nif-generator",
  },
  {
    name: "Número da Função",
    description: "Baseado no nome obter número da função",
    path: "/function-number",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const { isDarkMode } = useDarkMode();

  const handleSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setIsOpen(false);
    navigate(tool.path);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900"
      }`}
    >
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-4 animate-fade-in">
          <h2
            className={`text-4xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Bem-vindo às nossas ferramentas
          </h2>
          <p
            className={`text-xl ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } animate-fade-in-up`}
          >
            Escolha uma ferramenta do menu para começar
          </p>
        </div>

        {/* Tool description */}
        {selectedTool && (
          <div
            className={`mt-12 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-lg shadow-lg p-6 animate-fade-in-up`}
          >
            <h3
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              {selectedTool.name}
            </h3>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
              {selectedTool.description}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
