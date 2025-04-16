
import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Step {
  Action: string;
  Data: string;
  "Expected Result": string;
}

function App() {
  const [title, setTitle] = useState("");
  const [formState, setFormState] = useState<Step>({
    Action: "",
    Data: "",
    "Expected Result": "",
  });
  const [steps, setSteps] = useState<Step[]>([]);
  const [copied, setCopied] = useState(false);

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
    if (!formState.Action && !formState.Data && !formState["Expected Result"]) return;
    setSteps([...steps, formState]);
    setFormState({ Action: "", Data: "", "Expected Result": "" });
  };

  const deleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const exportJSON = () => {
    if (steps.length === 0) return alert("No steps to export.");
    const blob = new Blob([JSON.stringify(steps, null, 2)], { type: "application/json" });
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
    <div style={{ fontFamily: "Arial", padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h2>Title</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a title for export..."
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />

      <h2>Add a Stepi</h2>
      <label>Action</label>
      <input
        value={formState.Action}
        onChange={(e) => handleChange("Action", e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <label>Data</label>
      <input
        value={formState.Data}
        onChange={(e) => handleChange("Data", e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <label>Expected Result</label>
      <input
        value={formState["Expected Result"]}
        onChange={(e) => handleChange("Expected Result", e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <button onClick={addStep} style={{ padding: "0.5rem 1rem", marginBottom: "2rem" }}>Add Step</button>

      <h2>Generated JSON</h2>
      <div style={{ background: "#111", padding: "1rem", borderRadius: 4, color: "white" }}>
        <SyntaxHighlighter language="json" style={oneDark} wrapLines>
          {JSON.stringify(steps, null, 2)}
        </SyntaxHighlighter>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
        <button onClick={exportJSON} style={{ backgroundColor: "green", color: "white", padding: "0.5rem 1rem" }}>
          Export JSON
        </button>
        <button onClick={copyJSON} style={{ backgroundColor: "royalblue", color: "white", padding: "0.5rem 1rem" }}>
          Copy JSON
        </button>
        {copied && <span style={{ color: "green" }}>✅ JSON copied!</span>}
      </div>

      {steps.map((step, i) => (
        <div key={i} style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem", position: "relative" }}>
          <button
            onClick={() => deleteStep(i)}
            style={{ position: "absolute", right: 10, top: 10, background: "crimson", color: "white", border: "none", padding: "0.2rem 0.5rem" }}
          >
            Delete
          </button>
          <button
            onClick={() => moveStep(i, "up")}
            style={{ position: "absolute", right: 60, top: 10 }}
          >
            ↑
          </button>
          <button
            onClick={() => moveStep(i, "down")}
            style={{ position: "absolute", right: 35, top: 10 }}
          >
            ↓
          </button>
          <SyntaxHighlighter language="json" style={oneDark}>
            {JSON.stringify(step, null, 2)}
          </SyntaxHighlighter>
        </div>
      ))}
    </div>
  );
}

export default App;
