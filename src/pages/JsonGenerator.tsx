// src/JsonGenerator.tsx
import React, { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-async-light";
import {
  tomorrow,
  okaidia,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Link } from "react-router-dom";
import { fetchSuggestions, addSuggestion } from "../services/firebase";
import { useDarkMode } from "../contexts/DarkModeContext";
import Header from "../components/Header";

interface Step {
  Action: string;
  Data: string;
  "Expected Result": string;
}

const syntaxHighlight = (json: string, isDarkMode: boolean) => {
  const colors = {
    string: isDarkMode ? "text-green-400" : "text-green-600",
    number: isDarkMode ? "text-yellow-400" : "text-yellow-600",
    boolean: isDarkMode ? "text-yellow-400" : "text-yellow-600",
    null: isDarkMode ? "text-red-400" : "text-red-600",
    key: isDarkMode ? "text-purple-400" : "text-purple-600",
  };

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = colors.number; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = colors.key; // key
        } else {
          cls = colors.string; // string
        }
      } else if (/true|false/.test(match)) {
        cls = colors.boolean; // boolean
      } else if (/null/.test(match)) {
        cls = colors.null; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
};

export default function JsonGenerator() {
  const [title, setTitle] = useState("");
  const [formState, setFormState] = useState<Step>({
    Action: "",
    Data: "",
    "Expected Result": "",
  });
  const [steps, setSteps] = useState<Step[]>([]);
  const [copied, setCopied] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { isDarkMode } = useDarkMode();

  // sugestões por campo
  const [suggestions, setSuggestions] = useState<{
    [K in keyof Step]: string[];
  }>({
    Action: [],
    Data: [],
    "Expected Result": [],
  });

  // limpa notificação de cópia
  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  // pré-carrega todas as sugestões (busca com prefixo vazio)
  useEffect(() => {
    (async () => {
      for (const field of [
        "Action",
        "Data",
        "Expected Result",
      ] as (keyof Step)[]) {
        const arr = await fetchSuggestions(field, "");
        setSuggestions((s) => ({ ...s, [field]: arr }));
      }
    })();
  }, []);

  // ao digitar, atualiza formState e busca sugestões
  async function handleChange(field: keyof Step, value: string) {
    setFormState((fs) => ({ ...fs, [field]: value }));
    const arr = await fetchSuggestions(field, value);
    setSuggestions((s) => ({ ...s, [field]: arr }));
  }

  // adiciona ou salva edição
  const addStep = async () => {
    if (!formState.Action && !formState.Data && !formState["Expected Result"]) {
      return;
    }

    if (editingIndex !== null) {
      const ns = [...steps];
      ns[editingIndex] = formState;
      setSteps(ns);
      setEditingIndex(null);
    } else {
      setSteps([...steps, formState]);
    }

    // persiste só o que ainda não existe
    if (formState.Action && !suggestions.Action.includes(formState.Action)) {
      await addSuggestion("Action", formState.Action);
    }
    if (formState.Data && !suggestions.Data.includes(formState.Data)) {
      await addSuggestion("Data", formState.Data);
    }
    if (
      formState["Expected Result"] &&
      !suggestions["Expected Result"].includes(formState["Expected Result"])
    ) {
      await addSuggestion("Expected Result", formState["Expected Result"]);
    }

    setFormState({ Action: "", Data: "", "Expected Result": "" });
  };

  const startEditing = (i: number) => {
    setFormState(steps[i]);
    setEditingIndex(i);
    document
      .querySelector(".bg-gray-50.p-6")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelEditing = () => {
    setFormState({ Action: "", Data: "", "Expected Result": "" });
    setEditingIndex(null);
  };

  const deleteStep = (i: number) => {
    if (editingIndex === i) cancelEditing();
    setSteps((ss) => ss.filter((_, idx) => idx !== i));
  };

  const moveStep = (i: number, dir: "up" | "down") => {
    const ns = [...steps];
    const ti = dir === "up" ? i - 1 : i + 1;
    if (ti < 0 || ti >= ns.length) return;
    [ns[i], ns[ti]] = [ns[ti], ns[i]];
    setSteps(ns);
    if (editingIndex === i) setEditingIndex(ti);
    else if (editingIndex === ti) setEditingIndex(i);
  };

  const exportJSON = () => {
    if (!steps.length) return alert("No steps to export.");
    const blob = new Blob([JSON.stringify(steps, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "steps"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copyJSON = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(steps, null, 2));
      setCopied(true);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = JSON.stringify(steps, null, 2);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
    }
  };

  // Combobox genérico
  const renderCombobox = (field: keyof Step) => (
    <Combobox
      as="div"
      className="relative overflow-visible"
      value={formState[field]}
      onChange={(v) => handleChange(field, v)}
    >
      <Combobox.Input
        className={`w-full px-4 py-2 border ${
          isDarkMode
            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
            : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
        } rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
        displayValue={(v: string) => v}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={`Enter ${field.toLowerCase()}...`}
      />
      {suggestions[field].length > 0 && (
        <Combobox.Options
          className={`absolute z-50 mt-1 w-full ${
            isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          } shadow-lg max-h-60 overflow-auto rounded-md ring-1 ring-black ring-opacity-5`}
        >
          {suggestions[field].map((opt, idx) => (
            <Combobox.Option
              key={idx}
              value={opt}
              className={({ active }) =>
                `cursor-pointer select-none py-2 px-4 ${
                  active ? (isDarkMode ? "bg-gray-700" : "bg-yellow-100") : ""
                }`
              }
            >
              {opt}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      )}
    </Combobox>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Header />
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg rounded-lg overflow-visible`}
          >
            <div className="p-6 space-y-6">
              <Link
                to="/"
                className={`inline-flex items-center ${
                  isDarkMode
                    ? "text-yellow-400 hover:text-yellow-300"
                    : "text-yellow-600 hover:text-yellow-800"
                }`}
              >
                ← Back to Home
              </Link>

              {/* Title */}
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for export..."
                  className={`w-full px-4 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                  } rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500`}
                />
              </div>

              {/* Form */}
              <div
                className={`${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                } p-6 rounded-lg space-y-4 overflow-visible`}
              >
                <h2
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {editingIndex !== null ? "Edit Step" : "Add a Step"}
                </h2>

                <div className="space-y-4">
                  {(
                    ["Action", "Data", "Expected Result"] as (keyof Step)[]
                  ).map((field) => (
                    <div key={field}>
                      <label
                        className={`block text-sm font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        } mb-1`}
                      >
                        {field}
                      </label>
                      {renderCombobox(field)}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addStep}
                    className="flex-1 bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700"
                  >
                    {editingIndex !== null ? "Save Changes" : "Add Step"}
                  </button>
                  {editingIndex !== null && (
                    <button
                      onClick={cancelEditing}
                      className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Steps List */}
              {steps.length > 0 && (
                <div className="space-y-4">
                  <h2
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Steps ({steps.length})
                  </h2>
                  <div className="space-y-3">
                    {steps.map((step, i) => (
                      <div
                        key={i}
                        className={`${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        } rounded-lg p-4 relative group`}
                      >
                        <div
                          className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex space-x-2 ${
                            isDarkMode ? "bg-gray-800" : "bg-white"
                          } bg-opacity-90 p-1 rounded-md shadow`}
                        >
                          <button
                            onClick={() => moveStep(i, "up")}
                            className={`p-1 ${
                              isDarkMode
                                ? "text-gray-300 hover:text-white"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
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
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveStep(i, "down")}
                            className={`p-1 ${
                              isDarkMode
                                ? "text-gray-300 hover:text-white"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
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
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => startEditing(i)}
                            className="p-1 text-yellow-600 hover:text-yellow-800"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteStep(i)}
                            className="p-1 text-red-600 hover:text-red-800"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(step).map(([key, value]) => (
                            <div key={key}>
                              <span
                                className={`text-sm font-bold ${
                                  isDarkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                {key}:
                              </span>
                              <p
                                className={`mt-1 ${
                                  isDarkMode ? "text-gray-100" : "text-gray-600"
                                }`}
                              >
                                {value || "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export and Copy Buttons */}
              {steps.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={exportJSON}
                    className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={copyJSON}
                    className="flex-1 bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700"
                  >
                    {copied ? "Copied!" : "Copy JSON"}
                  </button>
                </div>
              )}

              {/* JSON Preview */}
              {steps.length > 0 && (
                <div
                  className={`mt-6 ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  } rounded-lg p-4`}
                >
                  <pre
                    className={`font-mono text-sm whitespace-pre-wrap break-all ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlight(
                        JSON.stringify(steps, null, 2),
                        isDarkMode
                      ),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
