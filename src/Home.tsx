import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Tool {
  name: string;
  description: string;
  path: string;
}

interface User {
  username: string;
  role: "admin" | "user";
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
];

export default function Home() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setIsOpen(false);
    navigate(tool.path);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-3xl font-bold text-blue-600 flex items-center">
                <img
                  src="octo.svg"
                  alt="Octopus Logo"
                  className="w-8 h-8 mr-2"
                />
                Equipa Diferente
              </h1>
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || "User"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span>
                    {selectedTool?.name || "Selecione uma ferramenta"}
                  </span>
                  <svg
                    className={`h-5 w-5 transform transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    {tools.map((tool) => (
                      <button
                        key={tool.path}
                        onClick={() => handleSelect(tool)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="font-medium text-gray-900 group-hover:text-blue-600">
                          {tool.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tool.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900">
            Bem-vindo às nossas ferramentas
          </h2>
          <p className="text-xl text-gray-600 animate-fade-in-up">
            Escolha uma ferramenta do menu para começar
          </p>
        </div>

        {/* Tool description */}
        {selectedTool && (
          <div className="mt-12 bg-white rounded-lg shadow-lg p-6 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedTool.name}
            </h3>
            <p className="text-gray-600">{selectedTool.description}</p>
          </div>
        )}
      </main>
    </div>
  );
}
