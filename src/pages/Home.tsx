import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import Header from "../components/Header";

interface Tool {
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}

const tools: Tool[] = [
  {
    name: "Gerador de NIF",
    description:
      "Gere números de identificação fiscal válidos para diferentes países: Portugal, Espanha, França e Alemanha.",
    path: "/nif-generator",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    name: "Número da Função",
    description:
      "Encontre rapidamente o número da função com base no nome. Pesquisa inteligente com sugestões em tempo real.",
    path: "/function-number",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    name: "Upload de Evidências",
    description:
      "Importe evidências para o Xray Cloud. Faça upload de documentos e organize suas evidências de forma eficiente.",
    path: "/import-evidence",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
    ),
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const { isDarkMode } = useDarkMode();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tools.map((tool, index) => (
            <div
              key={tool.path}
              className={`group relative ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up border ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredTool(tool.path)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => navigate(tool.path)}
            >
              <div className="p-10 h-full min-h-[400px] cursor-pointer flex flex-col">
                <div className="flex flex-col items-center text-center flex-1 justify-center">
                  <div
                    className={`${
                      isDarkMode ? "text-yellow-400" : "text-yellow-600"
                    } transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 mb-6`}
                  >
                    <div className="w-16 h-16">{tool.icon}</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3
                      className={`text-3xl font-semibold mb-6 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } group-hover:text-yellow-500 transition-colors duration-300`}
                    >
                      {tool.name}
                    </h3>
                    <p
                      className={`text-lg flex-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      } transition-colors duration-300 leading-relaxed max-w-md mx-auto`}
                    >
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 w-full h-1 transform scale-x-0 transition-transform duration-300 ${
                    isDarkMode ? "bg-yellow-400" : "bg-yellow-600"
                  } ${hoveredTool === tool.path ? "scale-x-100" : ""}`}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
