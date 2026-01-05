import React from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import { updateUserSettings } from "../services/firebase";

interface User {
  name: string;
}

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<User | null>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
