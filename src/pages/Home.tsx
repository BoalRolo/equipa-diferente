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
    name: "JSON Step Generator",
    description:
      "Gerador de passos JSON para documentação de testes. Crie, edite e exporte passos de teste em formato JSON.",
    path: "/json-generator",
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
          d="M4 6h16M4 12h16m-7 6h7"
        />
      </svg>
    ),
  },
  {
    name: "Gerador de Código Depreciado",
    description:
      "Gere códigos de depreciação para produtos com base no EAN, preço, motivo e validade.",
    path: "/codigo-depreciado",
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
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
  },
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
    name: "Import Evidence",
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
        <div className="text-center space-y-4 animate-fade-in mb-16">
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
            } animate-fade-in-up max-w-2xl mx-auto`}
          >
            Escolha uma das nossas ferramentas especializadas para ajudar no seu
            trabalho diário
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {tools.map((tool, index) => (
            <div
              key={tool.path}
              className={`group relative ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up`}
              style={{ animationDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredTool(tool.path)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => navigate(tool.path)}
            >
              <div className="p-6 h-full cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div
                    className={`${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    } transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                  >
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } group-hover:text-blue-500 transition-colors duration-300`}
                    >
                      {tool.name}
                    </h3>
                    <p
                      className={`${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      } transition-colors duration-300`}
                    >
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 w-full h-1 transform scale-x-0 transition-transform duration-300 ${
                    isDarkMode ? "bg-blue-400" : "bg-blue-600"
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
