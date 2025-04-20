// src/JsonGenerator.tsx
import React, { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-async-light";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Link } from "react-router-dom";
import { fetchSuggestions, addSuggestion } from "../services/firebase";

interface Step {
  Action: string;
  Data: string;
  "Expected Result": string;
}

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

  // sugestões por campo
  const [suggestions, setSuggestions] = useState<{
    [K in keyof Step]: string[];
  }>({
    Action: [],
    Data: [],
    "Expected Result": [],
  });

  // limpa a notificação de cópia
  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  // pré‑carrega todas as sugestões (prefixo vazio) ao montar
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

  // busca sugestões conforme digita
  async function handleChange(field: keyof Step, value: string) {
    setFormState((fs) => ({ ...fs, [field]: value }));
    const arr = await fetchSuggestions(field, value);
    setSuggestions((s) => ({ ...s, [field]: arr }));
  }

  // adiciona ou salva edição de um passo
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

    // só persiste novas sugestões que ainda não existem
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

  // Combobox genérico para cada campo
  const renderCombobox = (field: keyof Step) => (
    <Combobox
      as="div"
      className="relative overflow-visible"
      value={formState[field]}
      onChange={(v) => handleChange(field, v)}
    >
      <Combobox.Input
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        displayValue={(v: string) => v}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={`Enter ${field.toLowerCase()}...`}
      />
      {suggestions[field].length > 0 && (
        <Combobox.Options className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 overflow-auto rounded-md ring-1 ring-black ring-opacity-5">
          {suggestions[field].map((opt, idx) => (
            <Combobox.Option
              key={idx}
              value={opt}
              className={({ active }) =>
                `cursor-pointer select-none py-2 px-4 ${
                  active ? "bg-blue-100" : ""
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          ← Back to Home
        </Link>

        {/* precise usar overflow-visible para não cortar o dropdown */}
        <div className="bg-white shadow-lg rounded-lg overflow-visible">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for export..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Form */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4 overflow-visible">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingIndex !== null ? "Edit Step" : "Add a Step"}
              </h2>

              <div className="space-y-4">
                {(["Action", "Data", "Expected Result"] as (keyof Step)[]).map(
                  (field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field}
                      </label>
                      {renderCombobox(field)}
                    </div>
                  )
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={addStep}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
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
                <h2 className="text-lg font-semibold text-gray-900">Steps</h2>
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 rounded-lg p-4 relative group"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex space-x-2 bg-white bg-opacity-90 p-1 rounded-md shadow">
                        <button
                          onClick={() => moveStep(i, "up")}
                          disabled={i === 0}
                          className="p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveStep(i, "down")}
                          disabled={i === steps.length - 1}
                          className="p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => startEditing(i)}
                          className="p-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteStep(i)}
                          className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                      <SyntaxHighlighter
                        language="json"
                        style={tomorrow}
                        className="rounded-md"
                      >
                        {JSON.stringify(step, null, 2)}
                      </SyntaxHighlighter>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated JSON */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Generated JSON
              </h2>
              <SyntaxHighlighter
                language="json"
                style={tomorrow}
                className="bg-gray-900 rounded-lg p-4"
              >
                {JSON.stringify(steps, null, 2)}
              </SyntaxHighlighter>
              <div className="flex gap-4">
                <button
                  onClick={exportJSON}
                  className="bg-green-600 text-white py-2 px-4 rounded-md"
                >
                  Export JSON
                </button>
                <button
                  onClick={copyJSON}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md"
                >
                  Copy JSON
                </button>
                {copied && (
                  <span className="text-green-600 flex items-center">
                    ✓ Copied!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
