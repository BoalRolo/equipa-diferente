import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Step {
  Action: string;
  Data: string;
  "Expected Result": string;
}

const App = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [current, setCurrent] = useState<Step>({
    Action: "",
    Data: "",
    "Expected Result": "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [copyMessage, setCopyMessage] = useState<string>("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("history") || "[]");
    setSuggestions(saved);
  }, []);

  const updateHistory = (value: string) => {
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    if (!history.includes(value)) {
      const updated = [...history, value];
      localStorage.setItem("history", JSON.stringify(updated));
      setSuggestions(updated);
    }
  };

  const handleChange = (key: keyof Step, value: string) => {
    setCurrent({ ...current, [key]: value });
  };

  const handleAddStep = () => {
    if (current.Action.trim() === "") return;
    setSteps([...steps, current]);
    updateHistory(current.Action);
    updateHistory(current.Data);
    updateHistory(current["Expected Result"]);
    setCurrent({ Action: "", Data: "", "Expected Result": "" });
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];
    setSteps(newSteps);
  };

  const getSuggestions = (input: string) => {
    if (!input) return [];
    return suggestions.filter((item) =>
      item.toLowerCase().startsWith(input.toLowerCase())
    );
  };

  const exportJSON = () => {
    if (steps.length === 0) {
      alert("There are no steps to export.");
      return;
    }
    const filename = `${title || "steps"}.json`;
    const json = JSON.stringify(steps, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyJSON = () => {
    const json = JSON.stringify(steps, null, 2);
    try {
      navigator.clipboard
        .writeText(json)
        .then(() => {
          setCopyMessage("✅ JSON copied!");
          setTimeout(() => setCopyMessage(""), 2000);
        })
        .catch(() => {
          const textarea = document.createElement("textarea");
          textarea.value = json;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          setCopyMessage("✅ JSON copied!");
          setTimeout(() => setCopyMessage(""), 2000);
        });
    } catch (err) {
      alert("Failed to copy JSON.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Card className="border-2 border-gray-300 shadow-md">
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-bold">Title</h2>
          <Input
            className="border-2 border-gray-400"
            placeholder="Enter a title for export..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-300 shadow-md">
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-bold">Add a Step</h2>

          <div className="space-y-1">
            <label className="font-medium">Action</label>
            <Input
              className="border-2 border-gray-400 focus:ring-2 focus:ring-blue-500"
              value={current.Action}
              onChange={(e) => handleChange("Action", e.target.value)}
              list="action-suggestions"
            />
            <datalist id="action-suggestions">
              {getSuggestions(current.Action).map((s, i) => (
                <option key={i} value={s} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="font-medium">Data</label>
            <Input
              className="border-2 border-gray-400 focus:ring-2 focus:ring-blue-500"
              value={current.Data}
              onChange={(e) => handleChange("Data", e.target.value)}
              list="data-suggestions"
            />
            <datalist id="data-suggestions">
              {getSuggestions(current.Data).map((s, i) => (
                <option key={i} value={s} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="font-medium">Expected Result</label>
            <Input
              className="border-2 border-gray-400 focus:ring-2 focus:ring-blue-500"
              value={current["Expected Result"]}
              onChange={(e) => handleChange("Expected Result", e.target.value)}
              list="result-suggestions"
            />
            <datalist id="result-suggestions">
              {getSuggestions(current["Expected Result"]).map((s, i) => (
                <option key={i} value={s} />
              ))}
            </datalist>
          </div>

          <Button
            className="bg-blue-900 text-white hover:bg-blue-800"
            onClick={handleAddStep}
          >
            Add Step
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-300 shadow-md">
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-bold">Generated JSON</h2>

          <div className="rounded bg-black text-white text-sm overflow-auto p-3">
            <SyntaxHighlighter
              language="json"
              style={oneDark}
              customStyle={{
                backgroundColor: "black",
                padding: "0.5rem",
                margin: 0,
                filter: "none",
                boxShadow: "none",
                textShadow: "none",
                borderRadius: "0.25rem",
              }}
              wrapLines={false}
              showLineNumbers={false}
              PreTag="div"
              CodeTag="div"
            >
              {JSON.stringify(steps, null, 2)}
            </SyntaxHighlighter>
          </div>

          <div className="flex gap-2 items-center">
            <Button
              className="bg-green-600 text-white hover:bg-green-500 font-semibold px-4 py-2 rounded"
              onClick={exportJSON}
            >
              Export JSON
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-500 font-semibold px-4 py-2 rounded"
              onClick={copyJSON}
            >
              Copy JSON
            </Button>
            {copyMessage && (
              <span className="text-green-600 font-medium">{copyMessage}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
