import React from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import { updateUserSettings } from "../services/firebase";
import { Combobox } from "@headlessui/react";

interface User {
  name: string;
}

interface Tool {
  name: string;
  description: string;
  path: string;
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

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<User | null>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Tool | null>(null);

  React.useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

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

  const filteredTools =
    query === ""
      ? tools
      : tools.filter(
          (tool) =>
            tool.name.toLowerCase().includes(query.toLowerCase()) ||
            tool.description.toLowerCase().includes(query.toLowerCase())
        );

  const handleSelect = (tool: Tool) => {
    setSelected(tool);
    setQuery("");
    navigate(tool.path);
  };

  return (
    <header
      className={`${
        isDarkMode ? "bg-gray-800 shadow-lg" : "bg-white shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1
              onClick={() => navigate("/")}
              className={`text-3xl font-bold flex items-center ${
                isDarkMode ? "text-yellow-400" : "text-yellow-600"
              } cursor-pointer hover:opacity-80 transition-opacity`}
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
            <div className="relative w-72">
              <Combobox value={selected} onChange={handleSelect}>
                <Combobox.Button className="relative w-full">
                  <Combobox.Input
                    className={`w-full px-4 py-2 border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500`}
                    displayValue={(tool: Tool) => tool?.name || ""}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Selecione uma ferramenta..."
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className={`w-5 h-5 ${
                        isDarkMode ? "text-gray-400" : "text-gray-400"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </Combobox.Button>
                {filteredTools.length > 0 && (
                  <Combobox.Options
                    className={`absolute z-50 w-full mt-1 ${
                      isDarkMode ? "bg-gray-700" : "bg-white"
                    } rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none text-base`}
                  >
                    {filteredTools.map((tool) => (
                      <Combobox.Option
                        key={tool.path}
                        value={tool}
                        className={({ active }) =>
                          `cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                            active
                              ? isDarkMode
                                ? "bg-gray-600 text-white"
                                : "bg-yellow-100 text-yellow-900"
                              : isDarkMode
                              ? "text-gray-200"
                              : "text-gray-900"
                          }`
                        }
                      >
                        {({ active, selected }) => (
                          <>
                            <div className="flex flex-col">
                              <span className={`block truncate font-medium`}>
                                {tool.name}
                              </span>
                              <span
                                className={`block truncate text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {tool.description}
                              </span>
                            </div>
                            {selected && (
                              <span
                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                  active ? "text-white" : "text-yellow-600"
                                }`}
                              >
                                <svg
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
              </Combobox>
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
  );
}
