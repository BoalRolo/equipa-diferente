import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import { updateUserSettings } from "../services/firebase";

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
  const [user, setUser] = useState<User | null>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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

  const handleLogout = async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // Save current dark mode preference to Firebase before logging out
      await updateUserSettings(user.userId, { darkMode: isDarkMode });
    }

    // Reset all user-related data
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");

    // Reset dark mode to system preference
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (isDarkMode !== systemPrefersDark) {
      toggleDarkMode();
    }

    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`${
          isDarkMode ? "bg-gray-800 shadow-lg" : "bg-white shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1
                className={`text-3xl font-bold flex items-center ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                <img
                  src="/equipa-diferente/octo.svg"
                  alt="Octopus Logo"
                  className="w-8 h-8 mr-2"
                />
                Equipa Diferente
              </h1>
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Welcome, {user?.name || "User"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700 text-yellow-400"
                    : "bg-gray-100 text-gray-700"
                } hover:bg-opacity-80 transition-colors`}
              >
                {isDarkMode ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`inline-flex items-center gap-2 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200"
                      : "bg-white border-gray-300 text-gray-700"
                  } border rounded-lg px-4 py-2 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-72`}
                >
                  <span className="flex-1 text-left">
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
                  <div
                    className={`absolute right-0 mt-2 w-72 ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } rounded-lg shadow-lg border py-1 z-10`}
                  >
                    {tools.map((tool) => (
                      <button
                        key={tool.path}
                        onClick={() => handleSelect(tool)}
                        className={`w-full text-left px-4 py-3 ${
                          isDarkMode
                            ? "hover:bg-gray-700 text-gray-200"
                            : "hover:bg-gray-50 text-gray-900"
                        } transition-colors group`}
                      >
                        <div
                          className={`font-medium ${
                            isDarkMode
                              ? "group-hover:text-blue-400"
                              : "group-hover:text-blue-600"
                          }`}
                        >
                          {tool.name}
                        </div>
                        <div
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
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
