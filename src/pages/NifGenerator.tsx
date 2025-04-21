import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import Header from "../components/Header";

interface CountryOption {
  value: string;
  label: string;
  flag: string;
}

const countries: CountryOption[] = [
  { value: "pt", label: "Portugal", flag: "🇵🇹" },
  { value: "es", label: "Espanha", flag: "🇪🇸" },
  { value: "fr", label: "França", flag: "🇫🇷" },
  { value: "de", label: "Alemanha", flag: "🇩🇪" },
];

const NifGenerator = () => {
  const [pais, setPais] = useState("pt");
  const [nif, setNif] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isDarkMode } = useDarkMode();

  const selectedCountry = countries.find((c) => c.value === pais)!;

  // Funções de cálculo de NIF por país...
  const gerarNifPortugal = () => {
    const prefixosValidos = [1, 2, 3, 5, 6, 8];
    const prefixo =
      prefixosValidos[
        Math.floor(Math.random() * prefixosValidos.length)
      ].toString();
    const corpo = Array.from({ length: 7 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    const base = prefixo + corpo;
    const soma = base
      .split("")
      .map((n, i) => parseInt(n) * (9 - i))
      .reduce((a, b) => a + b, 0);
    let resto = soma % 11;
    let digito = resto < 2 ? 0 : 11 - resto;
    setNif(base + digito);
  };

  const gerarNifEspanha = () => {
    const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
    const numero = Math.floor(Math.random() * 100000000);
    const letra = letras[numero % 23];
    setNif(numero.toString().padStart(8, "0") + letra);
  };

  const gerarNifFranca = () => {
    const prefixo = Math.floor(Math.random() * 2) + 1;
    const resto = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    setNif(prefixo + resto);
  };

  const gerarNifAlemanha = () => {
    const base = Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    setNif(base);
  };

  const gerarNif = () => {
    switch (pais) {
      case "pt":
        gerarNifPortugal();
        break;
      case "es":
        gerarNifEspanha();
        break;
      case "fr":
        gerarNifFranca();
        break;
      case "de":
        gerarNifAlemanha();
        break;
      default:
        setNif("(País não suportado)");
    }
    setCopied(false);
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(nif);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Header />
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg rounded-lg overflow-visible`}
          >
            <div className="p-8 space-y-6">
              <Link
                to="/"
                className={`inline-flex items-center ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                ← Voltar à Home
              </Link>

              {/* Título */}
              <div className="text-center">
                <h1
                  className={`text-3xl font-bold flex items-center justify-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedCountry.flag} Gerador de NIF
                </h1>
                <p
                  className={`mt-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Gere números de identificação fiscal válidos para diferentes
                  países
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                {/* Country Selector */}
                <div className="relative">
                  <button
                    type="button"
                    className={`relative w-full border rounded-lg pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <span className="flex items-center">
                      <span className="text-2xl mr-3">
                        {selectedCountry.flag}
                      </span>
                      <span className="block truncate">
                        {selectedCountry.label}
                      </span>
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className={`h-5 w-5 ${
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
                  </button>

                  {/* Dropdown flutuante */}
                  {isOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                      />
                      <ul
                        className={`absolute z-20 mt-1 w-full shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm ${
                          isDarkMode ? "bg-gray-700" : "bg-white"
                        }`}
                        role="listbox"
                      >
                        {countries.map((country) => (
                          <li
                            key={country.value}
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                              country.value === pais
                                ? isDarkMode
                                  ? "bg-gray-600 text-white"
                                  : "bg-gray-50 text-blue-600"
                                : isDarkMode
                                ? "text-gray-200 hover:bg-gray-600"
                                : "text-gray-900 hover:bg-gray-100"
                            }`}
                            role="option"
                            onClick={() => {
                              setPais(country.value);
                              setIsOpen(false);
                            }}
                          >
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">
                                {country.flag}
                              </span>
                              <span
                                className={
                                  country.value === pais
                                    ? "font-semibold"
                                    : "font-normal"
                                }
                              >
                                {country.label}
                              </span>
                            </div>
                            {country.value === pais && (
                              <span
                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                  isDarkMode ? "text-white" : "text-blue-600"
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
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Botão Gerar */}
                <button
                  onClick={gerarNif}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-lg font-medium"
                >
                  Gerar NIF
                </button>

                {/* Resultado */}
                {nif && (
                  <div
                    className={`mt-6 rounded-lg p-4 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          NIF Gerado para {selectedCountry.flag}{" "}
                          {selectedCountry.label}
                        </p>
                        <p
                          className={`mt-1 text-2xl font-bold font-mono ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {nif}
                        </p>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className={`ml-4 p-2 focus:outline-none ${
                          isDarkMode
                            ? "text-gray-300 hover:text-white"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        title="Copiar para a área de transferência"
                      >
                        {copied ? (
                          <svg
                            className="w-6 h-6 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
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
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NifGenerator;
