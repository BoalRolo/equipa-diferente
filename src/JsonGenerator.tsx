import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Link } from "react-router-dom";

interface Step {
  Action: string;
  Data: string;
  "Expected Result": string;
}

function JsonGenerator() {
  const [title, setTitle] = useState("");
  const [formState, setFormState] = useState<Step>({
    Action: "",
    Data: "",
    "Expected Result": "",
  });
  const [steps, setSteps] = useState<Step[]>([]);
  const [copied, setCopied] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleChange = (field: keyof Step, value: string) => {
    setFormState({ ...formState, [field]: value });
  };

  const addStep = () => {
    if (!formState.Action && !formState.Data && !formState["Expected Result"])
      return;

    if (editingIndex !== null) {
      // Update existing step
      const newSteps = [...steps];
      newSteps[editingIndex] = formState;
      setSteps(newSteps);
      setEditingIndex(null);
    } else {
      // Add new step
      setSteps([...steps, formState]);
    }

    setFormState({ Action: "", Data: "", "Expected Result": "" });
  };

  const startEditing = (index: number) => {
    setFormState(steps[index]);
    setEditingIndex(index);
    // Scroll to the form
    document
      .querySelector(".bg-gray-50.p-6")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelEditing = () => {
    setFormState({ Action: "", Data: "", "Expected Result": "" });
    setEditingIndex(null);
  };

  const deleteStep = (index: number) => {
    if (editingIndex === index) {
      cancelEditing();
    }
    setSteps(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];
    if (editingIndex === index) {
      setEditingIndex(targetIndex);
    } else if (editingIndex === targetIndex) {
      setEditingIndex(index);
    }
    setSteps(newSteps);
  };

  const exportJSON = () => {
    if (steps.length === 0) return alert("No steps to export.");
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
      const json = JSON.stringify(steps, null, 2);
      navigator.clipboard.writeText(json);
      setCopied(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = JSON.stringify(steps, null, 2);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Title Section */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for export..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Add/Edit Step Form */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingIndex !== null ? "Edit Step" : "Add a Step"}
              </h2>
              <div className="space-y-4">
                {Object.keys(formState).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field}
                    </label>
                    <input
                      value={formState[field as keyof Step]}
                      onChange={(e) =>
                        handleChange(field as keyof Step, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Enter ${field.toLowerCase()}...`}
                    />
                  </div>
                ))}
                <div className="flex gap-3">
                  <button
                    onClick={addStep}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    {editingIndex !== null ? "Save Changes" : "Add Step"}
                  </button>
                  {editingIndex !== null && (
                    <button
                      onClick={cancelEditing}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
                      className={`bg-gray-50 rounded-lg p-4 relative group ${
                        editingIndex === i ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <button
                          onClick={() => moveStep(i, "up")}
                          disabled={i === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveStep(i, "down")}
                          disabled={i === steps.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => startEditing(i)}
                          className="p-1 hover:bg-blue-100 text-blue-600 rounded"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteStep(i)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                      <div className="pr-24">
                        <SyntaxHighlighter
                          language="json"
                          style={oneDark}
                          className="rounded-md"
                        >
                          {JSON.stringify(step, null, 2)}
                        </SyntaxHighlighter>
                      </div>
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
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language="json"
                  style={oneDark}
                  className="!m-0"
                >
                  {JSON.stringify(steps, null, 2)}
                </SyntaxHighlighter>
              </div>
              <div className="flex space-x-4 items-center">
                <button
                  onClick={exportJSON}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Export JSON
                </button>
                <button
                  onClick={copyJSON}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Copy JSON
                </button>
                {copied && (
                  <span className="text-green-600 flex items-center">
                    <svg
                      className="w-5 h-5 mr-1"
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
                    Copied!
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

export default JsonGenerator;
